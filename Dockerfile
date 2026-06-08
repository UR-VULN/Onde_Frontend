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
ARG VITE_S3_BASE_URL
ENV VITE_USER_API_BASE=$VITE_USER_API_BASE
ENV VITE_ADMIN_API_BASE=$VITE_ADMIN_API_BASE
ENV VITE_S3_BASE_URL=$VITE_S3_BASE_URL

RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]