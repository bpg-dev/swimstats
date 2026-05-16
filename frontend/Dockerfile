# Build stage
FROM node:24-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS builder

# Accept git commit as build argument (git not available in Docker context)
ARG GIT_COMMIT=unknown
ENV VITE_GIT_COMMIT=${GIT_COMMIT}

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (with cache mount)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage - use latest 2.11 for security fixes
FROM caddy:2.11-alpine@sha256:86deaf5e3d3408a6ccec08fbb79989783dd26e206ae10bcf78a801dc8c9ab794

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/caddy

# Set ownership for non-root user (nobody:nobody = 65534:65534)
RUN chown -R 65534:65534 /usr/share/caddy /etc/caddy

USER 65534:65534

EXPOSE 80 2019

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:2019/health || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
