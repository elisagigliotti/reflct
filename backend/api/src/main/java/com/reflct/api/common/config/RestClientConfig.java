package com.reflct.api.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Configura i RestClient verso i microservizi Python (ai-service, scraping-service)
 * definiti nel docker-compose del monorepo. URL configurabili via application.yml
 * (reflct.ai-service.base-url, reflct.scraping-service.base-url).
 */
@Configuration
public class RestClientConfig {

    @Value("${reflct.ai-service.base-url:http://localhost:8001}")
    private String aiServiceBaseUrl;

    @Value("${reflct.scraping-service.base-url:http://localhost:8002}")
    private String scrapingServiceBaseUrl;

    @Value("${reflct.http-client.connect-timeout-ms:3000}")
    private int connectTimeoutMs;

    @Value("${reflct.http-client.read-timeout-ms:10000}")
    private int readTimeoutMs;

    private ClientHttpRequestFactory requestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        factory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        return factory;
    }

    @Bean
    public RestClient aiServiceRestClient() {
        return RestClient.builder()
                .baseUrl(aiServiceBaseUrl)
                .requestFactory(requestFactory())
                .build();
    }

    @Bean
    public RestClient scrapingServiceRestClient() {
        return RestClient.builder()
                .baseUrl(scrapingServiceBaseUrl)
                .requestFactory(requestFactory())
                .build();
    }
}
