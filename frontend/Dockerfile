# syntax=docker/dockerfile:1

# ---------- Stage 1: build the static site with Node ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (cached unless package*.json changes).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_API_URL into the JavaScript at BUILD time. The API is called
# from the user's BROWSER, so this must be an address the browser can reach
# (the backend's published port on your machine), not a Docker-internal name.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------- Stage 2: serve the built files with nginx ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1/ || exit 1