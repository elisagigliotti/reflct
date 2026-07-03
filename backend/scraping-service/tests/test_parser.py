import pytest

from app.parser import (
    extract_source_domain,
    guess_brand_from_domain,
    llm_fallback_extract,
    parse_garment_html,
)

HTML_CON_META_OG = """
<html>
<head>
    <title>Pagina prodotto generica</title>
    <meta property="og:title" content="Camicia Oxford Slim Fit" />
    <meta property="og:image" content="https://static.zara.com/photos/camicia-front.jpg" />
    <meta property="og:price:amount" content="39.95" />
</head>
<body>
    <h1>Camicia Oxford Slim Fit</h1>
    <img src="https://static.zara.com/photos/camicia-front.jpg" width="600" height="800" />
    <p>Prezzo: €39,95</p>
</body>
</html>
"""

HTML_SENZA_META_CON_FALLBACK = """
<html>
<head>
    <title>Felpa Girocollo Grigia - Negozio Esempio</title>
</head>
<body>
    <img src="/img/icona-piccola.png" width="16" height="16" />
    <img src="https://cdn.esempio-shop.com/felpa-grigia.jpg" width="800" height="1000" />
    <p>Il nostro prezzo speciale e' di $59.99 solo per oggi!</p>
</body>
</html>
"""

HTML_SENZA_NOME_UTILE = """
<html>
<head></head>
<body><p>pagina vuota senza titolo ne' meta</p></body>
</html>
"""


def test_parse_garment_html_uses_meta_og_tags_with_priority():
    item = parse_garment_html(HTML_CON_META_OG, "https://www.zara.com/it/prodotto/camicia-123.html")

    assert item.nome == "Camicia Oxford Slim Fit"
    assert item.foto_front_url == "https://static.zara.com/photos/camicia-front.jpg"
    assert item.prezzo_attuale == 39.95
    assert item.brand == "Zara"
    assert item.source_domain == "zara.com"
    assert item.url_originale == "https://www.zara.com/it/prodotto/camicia-123.html"


def test_parse_garment_html_falls_back_to_title_image_and_price_regex():
    item = parse_garment_html(HTML_SENZA_META_CON_FALLBACK, "https://www.esempio-shop.com/felpa")

    assert item.nome == "Felpa Girocollo Grigia - Negozio Esempio"
    assert item.foto_front_url == "https://cdn.esempio-shop.com/felpa-grigia.jpg"
    assert item.prezzo_attuale == 59.99
    # dominio non nella mappa statica -> fallback capitalizzazione
    assert item.brand == "Esempio-shop"
    assert item.source_domain == "esempio-shop.com"


def test_parse_garment_html_raises_when_no_name_available():
    with pytest.raises(ValueError):
        parse_garment_html(HTML_SENZA_NOME_UTILE, "https://www.sito-sconosciuto.com/x")


@pytest.mark.parametrize(
    "domain,expected_brand",
    [
        ("zara.com", "Zara"),
        ("www.zara.com", "Zara"),
        ("hm.com", "H&M"),
        ("asos.com", "ASOS"),
        ("zalando.it", "Zalando"),
        ("mango.com", "Mango"),
        ("shein.com", "Shein"),
        ("amazon.com", "Amazon Fashion"),
        ("farfetch.com", "Farfetch"),
    ],
)
def test_guess_brand_from_domain_top_sites(domain, expected_brand):
    assert guess_brand_from_domain(domain) == expected_brand


def test_guess_brand_from_domain_fallback_capitalizes_unknown_domain():
    assert guess_brand_from_domain("miosito-strano.com") == "Miosito-strano"


def test_extract_source_domain_strips_www():
    assert extract_source_domain("https://www.zalando.it/prodotto/1") == "zalando.it"
    assert extract_source_domain("https://asos.com/prodotto/2") == "asos.com"


def test_llm_fallback_extract_not_implemented():
    with pytest.raises(NotImplementedError):
        llm_fallback_extract("<html></html>")
