# Reflct — Infra (Docker Compose)

Orchestrazione locale/dev di tutto lo stack Reflct in un'unica rete Docker.

**Non testato in questo ambiente**: Docker non è disponibile sulla macchina usata per
generare questo scaffold (`docker --version` fallisce). I file sono scritti e coerenti
tra loro (porte, nomi servizio, variabili d'ambiente), ma non sono stati eseguiti.

## Servizi

| Servizio | Immagine/build | Porta host di default | Note |
|---|---|---|---|
| `web` | build `../apps/web` (Angular → nginx) | `8080` → 80 | Serve la PWA e fa da reverse proxy per `/api` e `/ws` verso `backend-api` (vedi `nginx/nginx.conf`) |
| `backend-api` | build `../backend/api` (Spring Boot) | `8090` → 8080 | REST API + WebSocket |
| `ai-service` | build `../backend/ai-service` (FastAPI) | `8001` | Body scan, try-on render, size advisor |
| `scraping-service` | build `../backend/scraping-service` (FastAPI) | `8002` | Import capo da URL e-commerce |
| `postgres` | `postgres:16-alpine` | `5432` | Database principale |
| `redis` | `redis:7-alpine` | `6379` | Cache/sessioni/pub-sub (predisposto, non ancora usato dal backend) |
| `minio` | `minio/minio` | `9000` (API) / `9001` (console) | Storage S3-compatible per foto/video |

## Uso

```bash
cd infra
cp .env.example .env   # personalizza se serve
docker compose up --build
```

Poi:
- Web app: `http://localhost:8080`
- API diretta (bypassando nginx): `http://localhost:8090/api/v1/...`
- Swagger UI backend: `http://localhost:8090/swagger-ui.html`
- MinIO console: `http://localhost:9001`

## Note

- `web` monta `../infra/nginx/nginx.conf` come volume di sola lettura, sovrascrivendo
  la config di default dell'immagine nginx costruita da `apps/web/Dockerfile` (che
  contiene solo i file statici della build Angular).
- `backend-api` aspetta che `postgres` sia `healthy` prima di avviarsi (Flyway applica
  `V1__init.sql` al primo avvio).
- Nessun dato reale/segreto in `.env.example`: sono tutti valori di sviluppo.
