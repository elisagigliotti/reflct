# Reflct AI Service

Microservizio FastAPI (Python 3.11) che espone body scan (stima misure corporee),
try-on render (mock) e size advisor per la piattaforma Reflct — vedi Concept
Document v4.0, sez. 4.2 ("AI Service"), 5.1, 5.3.

Porta di default: **8001**.

## Endpoint

| Metodo | Path | Descrizione |
|---|---|---|
| POST | `/bodyscan/estimate` | Stima REALE (non piu' mock): rileva la persona nella foto con MediaPipe Pose Landmarker (BlazePose) e calibra le distanze sull'altezza dichiarata. Rifiuta con 422 foto senza persona, corpo non a figura intera, o inquadratura non plausibile. |
| POST | `/tryon/render` | Crea un job di rendering try-on mock, ritorna `{job_id, status: "processing"}`. |
| GET | `/tryon/render/{job_id}` | Ritorna lo stato del job. MOCK: simula "pronto" subito. Nella realta' userebbe OOTDiffusion/ControlNet async su GPU (sez. 5.1). |
| POST | `/size-advisor` | Logica REALE: confronta le misure corpo con una tabella taglie e sceglie la taglia con distanza pesata minima. Ritorna `{consigliata, fit_score, dettaglio}`. |
| GET | `/health` | Health check. |

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
  del processo). E' uno scaffold, non un sistema di code/produzione.
- `size_advisor.py`: logica realmente "di dominio" del servizio, non
  mockata — testata con pytest su casi puri (nessuna dipendenza esterna).

## Docker

```bash
docker build -t reflct-ai-service .
docker run -p 8001:8001 reflct-ai-service
```

`docker --version` non è disponibile su questa macchina di sviluppo: il
Dockerfile è scritto e validato sintatticamente ma **non è stato eseguito**
in questo ambiente.
