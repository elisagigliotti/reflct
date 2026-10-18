# Reflct AI Service

Microservizio FastAPI (Python 3.12) che espone body scan (stima misure corporee),
try-on render fotorealistico (CatVTON) e size advisor per la piattaforma Reflct —
vedi Concept Document v4.0, sez. 4.2 ("AI Service"), 5.1, 5.3.

Porta di default: **8001**.

## Endpoint

| Metodo | Path | Descrizione |
|---|---|---|
| POST | `/bodyscan/estimate` | Stima REALE (non piu' mock): rileva la persona nella foto con MediaPipe Pose Landmarker (BlazePose) e calibra le distanze sull'altezza dichiarata. Rifiuta con 422 foto senza persona, corpo non a figura intera, o inquadratura non plausibile. |
| POST | `/tryon/render` | Rendering REALE (CatVTON, sincrono): scarica foto persona + capo, genera una maschera dai landmark posa e produce un'immagine fotorealistica. Ritorna `{job_id, status: "done"\|"failed"}`. |
| GET | `/tryon/render/{job_id}` | Ritorna il job gia' completato (nessuna vera coda: il rendering avviene dentro la POST, vedi sotto). |
| POST | `/size-advisor` | Logica REALE: confronta le misure corpo con una tabella taglie e sceglie la taglia con distanza pesata minima. Ritorna `{consigliata, fit_score, dettaglio}`. |
| GET | `/health` | Health check. |
| GET | `/outputs/{file}` | Serve staticamente le immagini renderizzate dal try-on. |

## Setup locale (verificato su questa macchina)

```bash
cd backend/ai-service
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload --port 8001
```

## Note implementative

- `bodyscan.py`: **REALE**, non piu' mock. Scarica la foto (`requests`), rileva
  33 landmark corporei con MediaPipe Pose Landmarker (modello BlazePose lite
  bundlato in `app/models_bin/pose_landmarker.task`, ~5.7MB, scaricato da
  `storage.googleapis.com/mediapipe-models` — vedi sotto se manca), poi
  calibra le distanze spalle/fianchi/caviglie in pixel sull'altezza dichiarata
  per stimare le 7 misure. Due controlli di plausibilita' aggiuntivi
  respingono foto dove la persona e' troppo piccola nell'inquadratura o la
  posa non e' frontale standard (spalle troppo strette rispetto al corpo:
  sintomo tipico di foto di profilo o mal geometrizzate). **Limite onesto**:
  una singola foto 2D non da' una circonferenza esatta (nessuna profondita'),
  quindi le misure di busto/vita/fianchi sono stime approssimate via fattori
  larghezza→circonferenza empirici, non misurazioni cliniche. La versione
  "vera" descritta nel Concept (BodyMeasureNet, una rete neurale dedicata
  alla stima metrica) resta fuori scope per questo scaffold — qui ci si ferma
  al primo stadio (pose detection reale) invece di inventare numeri a caso.
  Se `models_bin/pose_landmarker.task` manca, riscaricalo con:
  `curl -Lo app/models_bin/pose_landmarker.task https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`
- `tryon.py`: i job sono tenuti in un dict in-memory (si perdono al riavvio
  del processo) e il rendering e' SINCRONO dentro `POST /tryon/render` (nessuna
  coda GPU/worker separato): va bene per un utente alla volta, non per carico
  concorrente reale.
- `size_advisor.py`: logica realmente "di dominio" del servizio, non
  mockata — testata con pytest su casi puri (nessuna dipendenza esterna).

## Try-On fotorealistico (CatVTON)

`app/tryon_model/` contiene codice **vendorizzato** (copiato, non installato
come pacchetto) da [CatVTON](https://github.com/Zheng-Chong/CatVTON)
(ICLR 2025), scelto perche' e' il modello open-source di virtual try-on piu'
leggero disponibile (899M parametri, funziona sotto 8GB VRAM). Ogni file
vendorizzato riporta in testa la provenienza esatta.

**⚠️ LICENZA — SOLO USO NON COMMERCIALE.** Codice e pesi CatVTON sono
CC BY-NC-SA 4.0. Lo stesso vale per praticamente tutti i modelli open-source
di virtual try-on di qualita' paragonabile (IDM-VTON, OOTDiffusion): e' un
vincolo di tutto il settore, non specifico di questa scelta. Questa
integrazione va bene per sviluppo/demo/validazione prodotto, ma **prima di
un lancio commerciale** (il prodotto ha piani PREMIUM/PRO) va sostituita con:
un'API a pagamento con licenza commerciale (es. FASHN.ai, Vertex AI Virtual
Try-On), oppure una licenza commerciale negoziata direttamente con gli autori
di uno di questi modelli.

**Come funziona la maschera.** CatVTON originale userebbe SCHP + DensePose
(human parsing) per una maschera precisa dei contorni del corpo — entrambi
richiedono Detectron2, che non ha wheel Windows ufficiali e va compilato da
sorgente (rischio alto di rompere l'ambiente). `app/tryon_mask.py` genera
invece una maschera approssimata (un trapezoide) dai landmark posa di
MediaPipe (stesso modello del body-scan), classificando la regione
upper/lower/full-body da parole chiave nella categoria del capo. E' meno
preciso di una vera human-parsing mask, ma diffusion inpainting come CatVTON
tollera ragionevolmente bene maschere imperfette.

**Setup (in aggiunta a `requirements.txt`, vedi commento li' dentro):**

```bash
# torch >= 2.6 e' un requisito duro: transformers recenti rifiutano di
# caricare pesi non-safetensors (safety_checker) con torch piu' vecchio
# (CVE-2025-32434). cu121 si ferma a 2.5.1: usa cu124/cu126/cu128 (o l'indice
# CUDA giusto per la tua GPU).
pip install "torch==2.7.1" --index-url https://download.pytorch.org/whl/cu126
pip install diffusers==0.29.2 "transformers>=4.44,<5" "accelerate>=0.31" safetensors "huggingface_hub[hf_xet]"
```

**Nota Windows:** se scarichi i pesi con `snapshot_download`/`from_pretrained`
e non hai la "Modalita' sviluppatore" attiva (o non esegui Python come admin),
huggingface_hub non riesce a creare i symlink della sua cache. Imposta
`HF_HUB_DISABLE_SYMLINKS=1` (i file vengono copiati invece che linkati: usa
piu' spazio disco ma funziona sempre) prima di scaricare i pesi la prima volta.

Al primo avvio (prima richiesta a `/tryon/render`), la pipeline scarica da
HuggingFace Hub: `stable-diffusion-v1-5/stable-diffusion-inpainting`
(~5GB), `stabilityai/sd-vae-ft-mse` (~335MB) e i pesi d'attenzione
`zhengchong/CatVTON` (~1.7GB) — circa 7GB totali, serviti poi dalla cache
locale HuggingFace (`~/.cache/huggingface`).

**Configurazione (env var, tutte opzionali):**

| Variabile | Default | Descrizione |
|---|---|---|
| `TRYON_BASE_CKPT` | `stable-diffusion-v1-5/stable-diffusion-inpainting` | Repo HF del modello base SD1.5 inpainting |
| `TRYON_ATTN_CKPT` | `zhengchong/CatVTON` | Repo HF dei pesi d'attenzione CatVTON |
| `TRYON_WIDTH` / `TRYON_HEIGHT` | `384` / `512` | Risoluzione di rendering — piu' bassa della raccomandazione originale (768x1024) per stare comodi sotto 8GB VRAM con margine per overhead Windows/altri processi |
| `TRYON_STEPS` | `30` | Step di denoising (l'originale usa 50: piu' step = piu' qualita' ma piu' lento) |
| `TRYON_GUIDANCE_SCALE` | `2.5` | Guidance scale (valore tarato dagli autori CatVTON, non cambiare senza motivo) |
| `AI_SERVICE_PUBLIC_BASE_URL` | `http://localhost:8001` | Base URL con cui viene prefissato l'URL delle immagini renderizzate (`/outputs/...`): deve essere raggiungibile dal browser/telefono del client, non solo da ai-service |

**GPU verificata:** RTX 4060 laptop (8GB VRAM) su questa macchina. Con
`weight_dtype=float16` e la risoluzione ridotta di default, il rendering
dovrebbe stare comodamente sotto il budget VRAM disponibile.

## Docker

```bash
docker build -t reflct-ai-service .
docker run -p 8001:8001 reflct-ai-service
```

`docker --version` non è disponibile su questa macchina di sviluppo: il
Dockerfile è scritto e validato sintatticamente ma **non è stato eseguito**
in questo ambiente.
