FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SSO_AUTH_SERVER
ARG VITE_SSO_REALM
ARG VITE_API_URL
ENV VITE_SSO_AUTH_SERVER=$VITE_SSO_AUTH_SERVER
ENV VITE_SSO_REALM=$VITE_SSO_REALM
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM caddy:2-alpine
COPY --from=builder /app/dist /srv/www/
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
