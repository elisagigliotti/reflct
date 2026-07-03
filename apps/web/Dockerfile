# Multi-stage build: compila la Angular PWA con Node, la serve con nginx.
# NOTA: non testato in questo ambiente (Node.js/npm/Docker non sono disponibili qui, vedi README).

FROM node:20-alpine AS build
WORKDIR /build
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine
# angular.json usa il builder classico "@angular-devkit/build-angular:browser"
# (non il nuovo "application"/esbuild), quindi l'output va direttamente in
# dist/reflct-web (nessuna sottocartella /browser).
COPY --from=build /build/dist/reflct-web /usr/share/nginx/html
EXPOSE 80
