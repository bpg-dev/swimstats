# Build stage
FROM golang:1.25-alpine@sha256:d9b2e14101f27ec8d09674cd01186798d227bb0daec90e032aeb1cd22ac0f029 AS builder

WORKDIR /app

# Install build dependencies (with cache mount)
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies (with cache mount)
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy source code
COPY . .

# Build the binary (with cache mounts for modules and build cache)
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
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
