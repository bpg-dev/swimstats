# Build stage
FROM node:24-alpine@sha256:931d7d57f8c1fd0e2179dbff7cc7da4c9dd100998bc2b32afc85142d8efbc213 AS builder

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

# Runtime stage
FROM nginx:1.29-alpine@sha256:b0f7830b6bfaa1258f45d94c240ab668ced1b3651c8a222aefe6683447c7bf55

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -S swimstats && adduser -S swimstats -G swimstats && \
    chown -R swimstats:swimstats /usr/share/nginx/html && \
    chown -R swimstats:swimstats /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R swimstats:swimstats /var/run/nginx.pid

USER swimstats

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
