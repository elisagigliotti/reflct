export const environment = {
  production: true,
  // In produzione il web gira dietro nginx (vedi infra/nginx/nginx.conf), che fa
  // reverse-proxy di /api verso backend-api: path relativo, stesso host/porta del sito.
  apiUrl: '/api/v1',
};
