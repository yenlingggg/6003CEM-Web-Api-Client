# ─── 1) BUILD STAGE ──────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# 1) copy only package files, install deps
COPY package.json package-lock.json* ./
RUN npm ci

# 2) copy rest of source and run your build
COPY . .
RUN npm run build

# ─── 2) PRODUCTION STAGE ─────────────────────────────────
FROM nginx:stable-alpine
# copy built static assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# expose port and run nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
