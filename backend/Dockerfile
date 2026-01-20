# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/server \
    ./cmd/server

# Runtime stage
FROM alpine:3.20

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN addgroup -S swimstats && adduser -S swimstats -G swimstats

# Copy binary from builder
COPY --from=builder /app/server /app/server

# Copy migrations for runtime migration support
COPY --from=builder /app/migrations /app/migrations

# Set ownership
RUN chown -R swimstats:swimstats /app

USER swimstats

EXPOSE 8080

ENTRYPOINT ["/app/server"]
