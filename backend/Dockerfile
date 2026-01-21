# Build stage
FROM golang:1.25-alpine@sha256:d9b2e14101f27ec8d09674cd01186798d227bb0daec90e032aeb1cd22ac0f029 AS builder

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
FROM alpine:3.20@sha256:765942a4039992336de8dd5db680586e1a206607dd06170ff0a37267a9e01958

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
