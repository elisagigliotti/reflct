package com.reflct.api.client;

import com.reflct.api.common.exception.UpstreamServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Component
public class ScrapingServiceClientImpl implements ScrapingServiceClient {

    private final RestClient scrapingServiceRestClient;

    public ScrapingServiceClientImpl(@Qualifier("scrapingServiceRestClient") RestClient scrapingServiceRestClient) {
        this.scrapingServiceRestClient = scrapingServiceRestClient;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> importGarment(String urlOriginale) {
        try {
            return scrapingServiceRestClient.post()
                    .uri("/scrape")
                    .body(Map.of("url", urlOriginale))
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            throw new UpstreamServiceException(
                    "Il servizio scraping-service non e' raggiungibile o ha restituito un errore durante l'import del capo da " + urlOriginale + ".", ex);
        }
    }
}
