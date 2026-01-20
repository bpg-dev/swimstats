#!/bin/bash
# Reset the SwimStats database to a fresh state

set -e

echo "🗑️  Stopping containers and removing database volume..."
docker-compose down -v

echo "🚀 Starting PostgreSQL..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be healthy..."
sleep 5

echo "📊 Running migrations..."
docker-compose --profile migrate up migrate

echo "✅ Database reset complete!"
echo ""
echo "The database is now clean with all tables created."
echo "You can start the backend with: cd backend && ENV=development go run ./cmd/server"
