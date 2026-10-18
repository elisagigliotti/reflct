"""
Vendorizzato (con tagli) da CatVTON (https://github.com/Zheng-Chong/CatVTON,
utils.py alla radice del repo, branch "main" scaricato 2026-07-07). Licenza
originale: CC BY-NC-SA 4.0 — SOLO USO NON COMMERCIALE, vedi
backend/ai-service/README.md sezione "Try-On".

Il file originale (507 righe) mescola queste utility di pre/post-processing
immagine con funzioni di training/dataset (DREAM, accelerator, dataset
VITON-HD/DressCode/Farfetch) non necessarie qui: restano solo le 6 funzioni
usate da pipeline.py per l'inferenza.
"""
import numpy as np
import PIL
import torch
from PIL import Image


def compute_vae_encodings(image: torch.Tensor, vae: torch.nn.Module) -> torch.Tensor:
    pixel_values = image.to(memory_format=torch.contiguous_format).float()
    pixel_values = pixel_values.to(vae.device, dtype=vae.dtype)
    with torch.no_grad():
        model_input = vae.encode(pixel_values).latent_dist.sample()
    model_input = model_input * vae.config.scaling_factor
    return model_input


def prepare_image(image):
    if isinstance(image, torch.Tensor):
        if image.ndim == 3:
            image = image.unsqueeze(0)
        image = image.to(dtype=torch.float32)
    else:
        if isinstance(image, (PIL.Image.Image, np.ndarray)):
            image = [image]
        if isinstance(image, list) and isinstance(image[0], PIL.Image.Image):
            image = [np.array(i.convert("RGB"))[None, :] for i in image]
            image = np.concatenate(image, axis=0)
        elif isinstance(image, list) and isinstance(image[0], np.ndarray):
            image = np.concatenate([i[None, :] for i in image], axis=0)
        image = image.transpose(0, 3, 1, 2)
        image = torch.from_numpy(image).to(dtype=torch.float32) / 127.5 - 1.0
    return image


def prepare_mask_image(mask_image):
    if isinstance(mask_image, torch.Tensor):
        if mask_image.ndim == 2:
            mask_image = mask_image.unsqueeze(0).unsqueeze(0)
        elif mask_image.ndim == 3 and mask_image.shape[0] == 1:
            mask_image = mask_image.unsqueeze(0)
        elif mask_image.ndim == 3 and mask_image.shape[0] != 1:
            mask_image = mask_image.unsqueeze(1)
        mask_image[mask_image < 0.5] = 0
        mask_image[mask_image >= 0.5] = 1
    else:
        if isinstance(mask_image, (PIL.Image.Image, np.ndarray)):
            mask_image = [mask_image]
        if isinstance(mask_image, list) and isinstance(mask_image[0], PIL.Image.Image):
            mask_image = np.concatenate(
                [np.array(m.convert("L"))[None, None, :] for m in mask_image], axis=0
            )
            mask_image = mask_image.astype(np.float32) / 255.0
        elif isinstance(mask_image, list) and isinstance(mask_image[0], np.ndarray):
            mask_image = np.concatenate([m[None, None, :] for m in mask_image], axis=0)
        mask_image[mask_image < 0.5] = 0
        mask_image[mask_image >= 0.5] = 1
        mask_image = torch.from_numpy(mask_image)
    return mask_image


def numpy_to_pil(images):
    """Convert a numpy image or a batch of images to a PIL image."""
    if images.ndim == 3:
        images = images[None, ...]
    images = (images * 255).round().astype("uint8")
    if images.shape[-1] == 1:
        pil_images = [Image.fromarray(image.squeeze(), mode="L") for image in images]
    else:
        pil_images = [Image.fromarray(image) for image in images]
    return pil_images


def resize_and_crop(image, size):
    w, h = image.size
    target_w, target_h = size
    if w / h < target_w / target_h:
        new_w = w
        new_h = w * target_h // target_w
    else:
        new_h = h
        new_w = h * target_w // target_h
    image = image.crop(
        ((w - new_w) // 2, (h - new_h) // 2, (w + new_w) // 2, (h + new_h) // 2)
    )
    image = image.resize(size, Image.LANCZOS)
    return image


def resize_and_padding(image, size):
    w, h = image.size
    target_w, target_h = size
    if w / h < target_w / target_h:
        new_h = target_h
        new_w = w * target_h // h
    else:
        new_w = target_w
        new_h = h * target_w // w
    image = image.resize((new_w, new_h), Image.LANCZOS)
    padding = Image.new("RGB", size, (255, 255, 255))
    padding.paste(image, ((target_w - new_w) // 2, (target_h - new_h) // 2))
    return padding
