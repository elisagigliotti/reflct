"""
Download sicuro delle immagini indicate dal client (body-scan, try-on).

Gli URL delle foto arrivano dall'utente (via backend/api): senza controlli
ai-service scaricherebbe qualunque indirizzo, compresi servizi interni
(localhost, rete privata, metadata cloud 169.254.169.254) -> SSRF. Regole:

- solo http/https;
- gli URL che iniziano con un prefisso fidato (lo storage foto di
  backend/api, env AI_TRUSTED_IMAGE_PREFIXES) passano sempre: in sviluppo
  e' su localhost, quindi va whitelisted esplicitamente;
- per tutti gli altri l'host deve risolversi SOLO in IP pubblici;
- niente redirect (potrebbero puntare a un IP interno dopo il controllo);
- dimensione massima scaricata (AI_MAX_IMAGE_BYTES, default 15MB).

Limite noto: il DNS rebinding (risoluzione diversa tra controllo e
download) non e' coperto; in produzione ai-service va comunque isolato in
rete e servito solo da backend/api.
"""
import ipaddress
import os
import socket
from urllib.parse import urlparse

import requests
from fastapi import HTTPException

_TIMEOUT_SECONDS = 15
_MAX_BYTES = int(os.environ.get("AI_MAX_IMAGE_BYTES", str(15 * 1024 * 1024)))
_TRUSTED_PREFIXES = tuple(
    p.strip()
    for p in os.environ.get(
        "AI_TRUSTED_IMAGE_PREFIXES",
        "http://localhost:8080/uploads/,http://127.0.0.1:8080/uploads/",
    ).split(",")
    if p.strip()
)


def _resolve(host: str) -> list[str]:
    return [info[4][0] for info in socket.getaddrinfo(host, None)]


def _check_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise HTTPException(status_code=422, detail="URL immagine non valido: servono http o https")
    if url.startswith(_TRUSTED_PREFIXES):
        return
    try:
        addresses = _resolve(parsed.hostname)
    except OSError as exc:
        raise HTTPException(status_code=422, detail=f"host dell'immagine non raggiungibile: {parsed.hostname}") from exc
    for addr in addresses:
        if not ipaddress.ip_address(addr.split("%")[0]).is_global:
            raise HTTPException(status_code=422, detail="URL immagine non consentito: indirizzo interno o privato")


def fetch_image_bytes(url: str) -> bytes:
    """Scarica al massimo _MAX_BYTES da un URL consentito. Solleva HTTPException(422)."""
    _check_url(url)
    try:
        response = requests.get(url, timeout=_TIMEOUT_SECONDS, stream=True, allow_redirects=False)
        if 300 <= response.status_code < 400:
            raise HTTPException(status_code=422, detail="URL immagine non consentito: redirect")
        response.raise_for_status()
        chunks, total = [], 0
        for chunk in response.iter_content(chunk_size=64 * 1024):
            total += len(chunk)
            if total > _MAX_BYTES:
                raise HTTPException(status_code=422, detail="immagine troppo grande")
            chunks.append(chunk)
        return b"".join(chunks)
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=422, detail=f"impossibile scaricare l'immagine da {url}") from exc
