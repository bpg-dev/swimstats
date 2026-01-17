# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM nginx:1.26-alpine

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
