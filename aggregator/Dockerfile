FROM golang:1.26-alpine as builder

WORKDIR /app

COPY go.mod .

RUN go mod download

COPY aggregator/ .

RUN go build -o aggregator .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/aggregator .

EXPOSE 8080

CMD ["./aggregator"]