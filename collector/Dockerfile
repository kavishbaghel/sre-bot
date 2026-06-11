FROM golang:1.26-alpine as builder

WORKDIR /app

COPY go.mod .

RUN go mod download

COPY collector/ .

RUN go build -o collector .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/collector .

EXPOSE 8080

CMD ["./collector"]