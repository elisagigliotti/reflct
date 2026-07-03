"""
Logica di parsing HTML isolata dal router FastAPI, cosi' da poter essere
testata senza fare vere richieste di rete (vedi tests/test_parser.py).

Implementazione REALE (non mock): estrae i dati del capo da un e-commerce
generico, in ordine di priorita':
  1. meta tag og:title / og:image / og:price:amount / product:price:amount
  2. fallback euristico: <title>, prima <img> "grande" nella pagina, regex
     prezzo tipo `[€$]\\s?\\d+([.,]\\d{2})?` nel testo della pagina

Il fallback LLM (GPT-4o-mini, Concept v4.0 sez. 5.2) e' rappresentato dalla
funzione `llm_fallback_extract`, che in questo scaffold non e' implementata.
"""
import re
from typing import Optional
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from app.models import GarmentItem

# Mappa statica dominio -> brand per i "top 20 siti" citati nel Concept
# Document v4.0 sez. 5.2 (Zara, H&M, ASOS, Zalando, Mango, Shein, Amazon
# Fashion, Farfetch) + qualche altro sito di moda plausibile.
_BRAND_MAP = {
    "zara.com": "Zara",
    "hm.com": "H&M",
    "www2.hm.com": "H&M",
    "asos.com": "ASOS",
    "zalando.it": "Zalando",
    "zalando.com": "Zalando",
    "mango.com": "Mango",
    "shein.com": "Shein",
    "amazon.com": "Amazon Fashion",
    "amazon.it": "Amazon Fashion",
    "farfetch.com": "Farfetch",
    "uniqlo.com": "Uniqlo",
    "bershka.com": "Bershka",
    "pullandbear.com": "Pull&Bear",
    "stradivarius.com": "Stradivarius",
    "massimodutti.com": "Massimo Dutti",
    "nike.com": "Nike",
    "adidas.com": "Adidas",
    "net-a-porter.com": "Net-a-Porter",
    "aboutyou.com": "About You",
    "boohoo.com": "Boohoo",
}

# Regex prezzo generico: simbolo valuta (euro o dollaro) seguito da un
# numero con eventuali decimali separati da punto o virgola.
_PRICE_REGEX = re.compile(r"[€$]\s?\d+(?:[.,]\d{2})?")


def extract_source_domain(url: str) -> str:
    """Estrae il dominio "pulito" (senza www.) da un URL."""
    netloc = urlparse(url).netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[len("www."):]
    return netloc


def guess_brand_from_domain(source_domain: str) -> str:
    """Deduce il brand dal dominio usando la mappa statica dei top siti.

    Fallback: capitalizza la prima parte del dominio (es. 'esempio.com' ->
    'Esempio').
    """
    domain_lookup = source_domain
    if domain_lookup.startswith("www."):
        domain_lookup = domain_lookup[len("www."):]

    if domain_lookup in _BRAND_MAP:
        return _BRAND_MAP[domain_lookup]

    # Prova anche con il dominio originale (nel caso arrivi gia' con www.)
    if source_domain in _BRAND_MAP:
        return _BRAND_MAP[source_domain]

    base = domain_lookup.split(".")[0]
    return base.capitalize() if base else domain_lookup


def _get_meta_content(soup: BeautifulSoup, *keys: str) -> Optional[str]:
    """Cerca il primo meta tag (per property o name) tra le chiavi date."""
    for key in keys:
        tag = soup.find("meta", attrs={"property": key}) or soup.find("meta", attrs={"name": key})
        if tag and tag.get("content"):
            return tag["content"].strip()
    return None


def _parse_price(raw: Optional[str]) -> Optional[float]:
    """Converte una stringa prezzo (es. '49.90', '49,90', '€49,90') in float."""
    if not raw:
        return None
    match = re.search(r"\d+(?:[.,]\d{1,2})?", raw)
    if not match:
        return None
    numero = match.group(0).replace(",", ".")
    try:
        return float(numero)
    except ValueError:
        return None


def _fallback_title(soup: BeautifulSoup) -> Optional[str]:
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    return None


def _fallback_first_large_image(soup: BeautifulSoup) -> Optional[str]:
    """Trova la prima <img> "grande" nella pagina (con width/height >= 200,
    quando gli attributi sono presenti; altrimenti la prima immagine con src
    valido come ultima spiaggia)."""
    candidates = soup.find_all("img")
    for img in candidates:
        src = img.get("src")
        if not src:
            continue
        width = img.get("width")
        height = img.get("height")
        try:
            if width and height and int(width) >= 200 and int(height) >= 200:
                return src
        except ValueError:
            continue

    # Nessuna immagine con dimensioni esplicite sufficientemente grandi:
    # ripiega sulla prima immagine con src non vuoto.
    for img in candidates:
        src = img.get("src")
        if src:
            return src
    return None


def _fallback_price_regex(soup: BeautifulSoup) -> Optional[float]:
    testo = soup.get_text(" ", strip=True)
    match = _PRICE_REGEX.search(testo)
    if not match:
        return None
    return _parse_price(match.group(0))


def parse_garment_html(html: str, url: str) -> GarmentItem:
    """Estrae un GarmentItem da HTML grezzo, con priorita' meta-tag > fallback euristico.

    Solleva ValueError se non e' possibile determinare nemmeno un nome
    minimo per il prodotto (ne' og:title ne' <title>).
    """
    soup = BeautifulSoup(html, "html.parser")
    source_domain = extract_source_domain(url)

    nome = _get_meta_content(soup, "og:title", "product:title")
    if not nome:
        nome = _fallback_title(soup)
    if not nome:
        raise ValueError("impossibile determinare il nome del prodotto (ne' og:title ne' <title>)")

    foto_front_url = _get_meta_content(soup, "og:image", "product:image")
    if not foto_front_url:
        foto_front_url = _fallback_first_large_image(soup)

    prezzo_raw = _get_meta_content(soup, "og:price:amount", "product:price:amount")
    prezzo_attuale = _parse_price(prezzo_raw)
    if prezzo_attuale is None:
        prezzo_attuale = _fallback_price_regex(soup)

    brand = guess_brand_from_domain(source_domain)

    return GarmentItem(
        url_originale=url,
        nome=nome,
        brand=brand,
        prezzo_attuale=prezzo_attuale,
        foto_front_url=foto_front_url,
        foto_back_url=None,
        source_domain=source_domain,
    )


def llm_fallback_extract(html: str) -> Optional[GarmentItem]:
    """Fallback LLM per l'estrazione quando il parsing euristico fallisce.

    In produzione chiamerebbe GPT-4o-mini (Concept v4.0 sez. 5.2) passandogli
    l'HTML (o una sua versione ripulita/troncata) e chiedendogli di estrarre
    nome/brand/prezzo/immagini in JSON strutturato. Viene invocata solo come
    ultima risorsa quando il parsing euristico (`parse_garment_html`) fallisce.
    """
    raise NotImplementedError(
        "richiede una chiave API LLM, non configurata in questo scaffold"
    )
