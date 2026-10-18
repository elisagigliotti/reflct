"""
Wrapper d'inferenza per il try-on fotorealistico (CatVTON, vedi
app/tryon_model/pipeline.py per la provenienza/licenza). Carica la pipeline
una sola volta per processo (come il pose landmarker in routers/bodyscan.py)
e la riusa per ogni richiesta.

ATTENZIONE LICENZA: CatVTON (codice + pesi) e' CC BY-NC-SA 4.0, SOLO USO NON
COMMERCIALE. Va sostituito (API a pagamento o licenza commerciale) prima di un
lancio commerciale reale — vedi README.md di questo servizio.
"""
import io
import logging
import os
import threading
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from fastapi import HTTPException
from PIL import Image

from app.safe_fetch import fetch_image_bytes
from app.tryon_mask import build_agnostic_mask
from app.tryon_model.pipeline import CatVTONPipeline

logger = logging.getLogger(__name__)

_BASE_CKPT = os.environ.get("TRYON_BASE_CKPT", "stable-diffusion-v1-5/stable-diffusion-inpainting")
_ATTN_CKPT = os.environ.get("TRYON_ATTN_CKPT", "zhengchong/CatVTON")
_WIDTH = int(os.environ.get("TRYON_WIDTH", "384"))
_HEIGHT = int(os.environ.get("TRYON_HEIGHT", "512"))
_STEPS = int(os.environ.get("TRYON_STEPS", "30"))
_GUIDANCE_SCALE = float(os.environ.get("TRYON_GUIDANCE_SCALE", "2.5"))

_pipeline: Optional[CatVTONPipeline] = None
# Un'unica GPU da 8GB: serializza sia il caricamento (evita doppio load se due
# richieste arrivano insieme al primo avvio) sia l'inferenza vera e propria
# (un rendering concorrente farebbe facilmente OOM sulla stessa scheda).
_lock = threading.Lock()


def _get_pipeline() -> CatVTONPipeline:
    global _pipeline
    if _pipeline is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        if device == "cpu":
            logger.warning("Nessuna GPU CUDA disponibile: il rendering try-on sara' molto lento su CPU.")
        logger.info("Carico la pipeline CatVTON (%s + %s) su %s...", _BASE_CKPT, _ATTN_CKPT, device)
        _pipeline = CatVTONPipeline(
            base_ckpt=_BASE_CKPT,
            attn_ckpt=_ATTN_CKPT,
            attn_ckpt_version="mix",
            weight_dtype=torch.float16 if device == "cuda" else torch.float32,
            device=device,
            use_tf32=True,
        )
        logger.info("Pipeline CatVTON pronta.")
    return _pipeline


def _download_pil_image(url: str) -> Image.Image:
    content = fetch_image_bytes(url)
    try:
        return Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="il contenuto scaricato non e' un'immagine valida") from exc


def render_tryon(person_image_url: str, garment_image_url: str, categoria: Optional[str] = None) -> Image.Image:
    """Scarica foto persona + capo, genera la maschera dai landmark posa e
    rende il risultato fotorealistico con CatVTON. Solleva HTTPException(422)
    se le immagini non sono valide/scaricabili."""
    person_image = _download_pil_image(person_image_url)
    garment_image = _download_pil_image(garment_image_url)

    person_bgr = np.array(person_image)[:, :, ::-1].copy()
    mask = build_agnostic_mask(person_bgr, categoria)

    with _lock:
        pipeline = _get_pipeline()
        generator = torch.Generator(device=pipeline.device).manual_seed(42)
        results = pipeline(
            image=person_image,
            condition_image=garment_image,
            mask=mask,
            num_inference_steps=_STEPS,
            guidance_scale=_GUIDANCE_SCALE,
            height=_HEIGHT,
            width=_WIDTH,
            generator=generator,
        )
    return results[0]
