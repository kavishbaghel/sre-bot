FROM node:alpine as frontend-builder

WORKDIR /app
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json ./
RUN npm install
COPY dashboard/frontend/ .
RUN npm run build

# Stage 2 — Build Go backend with embedded frontend
FROM golang:1.26-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /app/dist ./dashboard/backend/static
RUN go build -o sre-bot-dashboard ./dashboard/backend/


# Stage 3 — Final minimal image
FROM alpine:latest
WORKDIR /app
COPY --from=backend-builder /app/sre-bot-dashboard .
CMD ["./sre-bot-dashboard"]