# Build stage
FROM node:20-alpine@sha256:3960ed74dfe320a67bf8da9555b6bade25ebda2b22b6081d2f60fd7d5d430e9c AS builder

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
FROM nginx:1.26-alpine@sha256:1eadbb07820339e8bbfed18c771691970baee292ec4ab2558f1453d26153e22d

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
