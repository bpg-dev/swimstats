# Build stage
FROM golang:1.26-alpine@sha256:70b46548e42db77e0966aaf3619fd068734dc6c77584d526b91126504fd95816 AS builder

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
FROM gcr.io/distroless/static-debian12:nonroot@sha256:f5b485ea962d9bd1186b2f6b3a061191539b905b82ec395de78cbfae51f20e35

WORKDIR /app

# Copy timezone data from builder (distroless has no package manager)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary from builder (migrations are embedded via Go embed)
COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]
