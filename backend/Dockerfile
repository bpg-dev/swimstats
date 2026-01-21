# Build stage
FROM golang:1.24-alpine@sha256:598dbb5f4658bd66f3ad7bfda86a9af580812b57065d8854add882e64480d986 AS builder

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
FROM alpine:3.23@sha256:865b95f46d98cf867a156fe4a135ad3fe50d2056aa3f25ed31662dff6da4eb62

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
