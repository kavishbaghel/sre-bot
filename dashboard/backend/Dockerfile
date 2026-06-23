FROM golang:1.26-alpine as builder

WORKDIR /app

COPY go.mod .

COPY go.sum .

RUN go mod download

COPY dashboard/backend/ .

RUN go build -o dashboard .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/dashboard/backend .

EXPOSE 8080

CMD ["./backend"]