# Build stage
FROM golang:1.26-alpine@sha256:d4c4845f5d60c6a974c6000ce58ae079328d03ab7f721a0734277e69905473e5 AS builder

WORKDIR /app

# Install build dependencies (with cache mount)
# tzdata is needed for copying to distroless runtime image
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache git ca-certificates tzdata

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies (with cache mount)
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy source code
COPY . .

# Build the binary (with cache mounts for modules and build cache)
ARG TARGETOS=linux
ARG TARGETARCH
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build \
    -ldflags="-w -s" \
    -o /app/server \
    ./cmd/server

# Runtime stage - distroless for minimal attack surface
# nonroot variant runs as uid 65532 by default
FROM gcr.io/distroless/static-debian12:nonroot@sha256:cba10d7abd3e203428e86f5b2d7fd5eb7d8987c387864ae4996cf97191b33764

WORKDIR /app

# Copy timezone data from builder (distroless has no package manager)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary from builder (migrations are embedded via Go embed)
COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]
