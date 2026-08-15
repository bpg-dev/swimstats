# Build stage
FROM golang:1.26-alpine@sha256:0178a641fbb4858c5f1b48e34bdaabe0350a330a1b1149aabd498d0699ff5fb2 AS builder

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
FROM gcr.io/distroless/static-debian12:nonroot@sha256:1b7b9f0f0e0a1d2155f531db587cc48ec26aaf97ab64364225f5bf18a054e66a

WORKDIR /app

# Copy timezone data from builder (distroless has no package manager)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary from builder (migrations are embedded via Go embed)
COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]
