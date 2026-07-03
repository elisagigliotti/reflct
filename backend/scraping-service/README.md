# Reflct Scraping Service

Microservizio FastAPI (Python 3.11) che importa un capo da un URL
e-commerce generico — vedi Concept Document v4.0, sez. 4.2 ("Scraping
Service"), 5.2.

Porta di default: **8002**.

## Endpoint

| Metodo | Path | Descrizione |
|---|---|---|
| POST | `/scrape` | Input `{url}`. Scarica la pagina con `requests` e la parsa con BeautifulSoup, ritorna un `GarmentItem` (`url_originale, nome, brand, prezzo_attuale, foto_front_url, foto_back_url, source_domain`). |
| GET | `/health` | Health check. |

## Implementazione

- `app/parser.py` contiene tutta la logica di estrazione, isolata da FastAPI:
  1. priorita' ai meta tag `og:title` / `og:image` / `og:price:amount` /
     `product:price:amount`;
  2. fallback euristico: `<title>`, prima `<img>` "grande" della pagina,
     regex prezzo `[€$]\s?\d+([.,]\d{2})?` nel testo.
- `brand` e' dedotto dal `source_domain` tramite una mappa statica dei "top
  20 siti" citati nel Concept (Zara, H&M, ASOS, Zalando, Mango, Shein, Amazon
  Fashion, Farfetch, + altri plausibili come Uniqlo, Bershka, Nike...),
  altrimenti fallback alla capitalizzazione del dominio.
- `llm_fallback_extract(html)` rappresenta il fallback LLM (GPT-4o-mini,
  Concept v4.0 sez. 5.2) invocato solo quando il parsing euristico fallisce.
  In questo scaffold solleva `NotImplementedError` (nessuna chiave API LLM
  configurata) — il router lo intercetta e ritorna 422.
- Gestione errori HTTP: timeout/connessione -> 504, errore HTTP dal sito
  target o parsing impossibile -> 422.

## Setup locale (verificato su questa macchina)

```bash
cd backend/scraping-service
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload --port 8002
```

I test in `tests/test_parser.py` usano HTML fittizio locale (nessuna vera
richiesta di rete). I test in `tests/test_scrape_router.py` mockano le
richieste HTTP con la libreria `responses`.

## Docker

```bash
docker build -t reflct-scraping-service .
docker run -p 8002:8002 reflct-scraping-service
```

`docker --version` non è disponibile su questa macchina di sviluppo: il
Dockerfile è scritto e validato sintatticamente ma **non è stato eseguito**
in questo ambiente.
