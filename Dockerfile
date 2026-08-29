# Multi-stage Dockerfile for Google Cloud Run / Google Cloud Deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package*.json ./

# Install dependencies (clean install)
RUN npm ci || npm install

# Copy source files
COPY . .

# Build Vite frontend & bundle Express server
RUN npm run build

# Production Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy compiled outputs and static files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/*.png ./
COPY --from=builder /app/*.jpeg ./

EXPOSE 8080

CMD ["node", "dist/server.cjs"]
