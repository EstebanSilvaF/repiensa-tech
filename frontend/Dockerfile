# Build
FROM node:22-alpine AS builder

WORKDIR /frontend

COPY package*.json ./

RUN npm ci

COPY . .

# En Docker el navegador llama al mismo origen; nginx reenvía /api al backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# Producción
FROM nginx:stable-alpine

COPY --from=builder /frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
