import responses
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

HTML_ESEMPIO = """
<html>
<head>
    <title>Pagina prodotto</title>
    <meta property="og:title" content="Jeans Slim Blu" />
    <meta property="og:image" content="https://static.zara.com/jeans.jpg" />
    <meta property="og:price:amount" content="49.90" />
</head>
<body></body>
</html>
"""


@responses.activate
def test_scrape_endpoint_returns_garment_item():
    url = "https://www.zara.com/it/jeans-slim.html"
    responses.add(responses.GET, url, body=HTML_ESEMPIO, status=200, content_type="text/html")

    response = client.post("/scrape", json={"url": url})

    assert response.status_code == 200
    body = response.json()
    assert body["nome"] == "Jeans Slim Blu"
    assert body["brand"] == "Zara"
    assert body["prezzo_attuale"] == 49.90
    assert body["source_domain"] == "zara.com"


@responses.activate
def test_scrape_endpoint_returns_504_on_connection_error():
    import requests

    url = "https://www.sito-irraggiungibile.com/prodotto"
    responses.add(
        responses.GET,
        url,
        body=requests.exceptions.ConnectionError("connessione rifiutata"),
    )

    response = client.post("/scrape", json={"url": url})
    assert response.status_code == 504


@responses.activate
def test_scrape_endpoint_returns_422_on_http_error():
    url = "https://www.zara.com/it/prodotto-non-esistente.html"
    responses.add(responses.GET, url, body="not found", status=404)

    response = client.post("/scrape", json={"url": url})
    assert response.status_code == 422


@responses.activate
def test_scrape_endpoint_returns_422_when_no_name_extractable():
    url = "https://www.sito-vuoto.com/pagina"
    responses.add(responses.GET, url, body="<html><head></head><body>vuoto</body></html>", status=200)

    response = client.post("/scrape", json={"url": url})
    assert response.status_code == 422
