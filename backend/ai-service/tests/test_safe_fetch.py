"""Protezione SSRF del download immagini (app/safe_fetch.py)."""
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app import safe_fetch


class _FakeResponse:
    def __init__(self, body: bytes = b"img", status_code: int = 200):
        self._body = body
        self.status_code = status_code

    def raise_for_status(self):
        pass

    def iter_content(self, chunk_size):
        for i in range(0, len(self._body), chunk_size):
            yield self._body[i : i + chunk_size]


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1:5432/",
        "http://localhost:8001/health",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.5/foto.jpg",
        "http://192.168.1.10/foto.jpg",
        "http://[::1]/foto.jpg",
    ],
)
def test_blocks_internal_addresses(url):
    with patch("app.safe_fetch.requests.get") as get:
        with pytest.raises(HTTPException) as exc:
            safe_fetch.fetch_image_bytes(url)
    assert exc.value.status_code == 422
    get.assert_not_called()


@pytest.mark.parametrize("url", ["file:///etc/passwd", "ftp://example.com/a.jpg", "gopher://x/", "not-a-url"])
def test_blocks_non_http_schemes(url):
    with pytest.raises(HTTPException):
        safe_fetch.fetch_image_bytes(url)


def test_hostname_resolving_to_private_ip_is_blocked():
    with patch("app.safe_fetch._resolve", return_value=["10.1.2.3"]), patch("app.safe_fetch.requests.get") as get:
        with pytest.raises(HTTPException):
            safe_fetch.fetch_image_bytes("https://sembra-pubblico.example/foto.jpg")
    get.assert_not_called()


def test_trusted_upload_prefix_is_allowed_even_on_localhost():
    with patch("app.safe_fetch.requests.get", return_value=_FakeResponse(b"ok")) as get:
        assert safe_fetch.fetch_image_bytes("http://localhost:8080/uploads/abc.jpg") == b"ok"
    get.assert_called_once()
    assert get.call_args.kwargs["allow_redirects"] is False


def test_public_host_is_allowed():
    with patch("app.safe_fetch._resolve", return_value=["93.184.216.34"]), patch(
        "app.safe_fetch.requests.get", return_value=_FakeResponse(b"ok")
    ):
        assert safe_fetch.fetch_image_bytes("https://shop.example/foto.jpg") == b"ok"


def test_redirects_are_refused():
    with patch("app.safe_fetch._resolve", return_value=["93.184.216.34"]), patch(
        "app.safe_fetch.requests.get", return_value=_FakeResponse(status_code=302)
    ):
        with pytest.raises(HTTPException):
            safe_fetch.fetch_image_bytes("https://shop.example/foto.jpg")


def test_oversized_download_is_cut_off():
    big = b"x" * (safe_fetch._MAX_BYTES + 1)
    with patch("app.safe_fetch._resolve", return_value=["93.184.216.34"]), patch(
        "app.safe_fetch.requests.get", return_value=_FakeResponse(big)
    ):
        with pytest.raises(HTTPException):
            safe_fetch.fetch_image_bytes("https://shop.example/enorme.jpg")
