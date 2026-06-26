# Stage 1: Build React Application
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency configs
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
ARG VITE_USER_API_BASE=/user-api
ARG VITE_ADMIN_API_BASE=/admin-api
ARG VITE_ADMIN_LOCAL_BASE_PATH=/rookies-console
ARG VITE_ADMIN_LOGIN_SEGMENT=onde-entry-8k2p
ARG VITE_S3_ENDPOINT
ENV VITE_USER_API_BASE=$VITE_USER_API_BASE
ENV VITE_ADMIN_API_BASE=$VITE_ADMIN_API_BASE
ENV VITE_ADMIN_LOCAL_BASE_PATH=$VITE_ADMIN_LOCAL_BASE_PATH
ENV VITE_ADMIN_LOGIN_SEGMENT=$VITE_ADMIN_LOGIN_SEGMENT
ENV VITE_S3_ENDPOINT=$VITE_S3_ENDPOINT

RUN npm run build

# Stage 2: Serve using OpenResty (headers-more로 Server 헤더 마스킹 — 26.pdf)
FROM openresty/openresty:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.main.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]