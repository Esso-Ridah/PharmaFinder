# PharmaFinder Project Makefile
# Simplifies common development and deployment tasks

.PHONY: help install start stop restart build clean test deploy-dev deploy-prod backup logs

# Default target
help:
	@echo "🏥 PharmaFinder - Makefile Commands"
	@echo ""
	@echo "Development Commands:"
	@echo "  make install      - Install all dependencies"
	@echo "  make start        - Start development environment"
	@echo "  make stop         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make build        - Build all containers"
	@echo "  make clean        - Clean up containers and volumes"
	@echo "  make logs         - Show logs from all services"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-init      - Initialize database with schema and data"
	@echo "  make db-reset     - Reset database (DESTRUCTIVE)"
	@echo "  make db-backup    - Backup database"
	@echo "  make db-shell     - Open database shell"
	@echo ""
	@echo "Testing Commands:"
	@echo "  make test         - Run all tests"
	@echo "  make test-backend - Run backend tests only"
	@echo "  make test-frontend- Run frontend tests only"
	@echo "  make lint         - Run linting on all code"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy-dev   - Deploy to development environment"
	@echo "  make deploy-prod  - Deploy to production environment"
	@echo ""

# Installation
install:
	@echo "📦 Installing PharmaFinder dependencies..."
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

# Development Environment
start:
	@echo "🚀 Starting PharmaFinder development environment..."
	docker-compose up -d postgres redis
	@echo "⏳ Waiting for database to be ready..."
	@sleep 10
	docker-compose up backend frontend
	@echo "✅ Development environment started!"
	@echo "🌐 Frontend: http://localhost:3001 (ou 3000 si disponible)"
	@echo "🔧 Backend API: http://localhost:8000"
	@echo "📖 API Docs: http://localhost:8000/docs"

start-bg:
	@echo "🚀 Starting PharmaFinder in background..."
	docker-compose up -d
	@echo "✅ All services started in background!"

stop:
	@echo "🛑 Stopping PharmaFinder services..."
	docker-compose down
	@echo "✅ All services stopped!"

restart: stop start

build:
	@echo "🔨 Building PharmaFinder containers..."
	docker-compose build --no-cache
	@echo "✅ All containers built!"

clean:
	@echo "🧹 Cleaning up PharmaFinder environment..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Environment cleaned!"

logs:
	@echo "📜 Showing logs from all services..."
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Database Management
db-init:
	@echo "🗄️ Initializing database..."
	cd database && ./init.sh
	@echo "✅ Database initialized!"

db-reset:
	@echo "⚠️  DESTRUCTIVE: Resetting database..."
	@read -p "Are you sure you want to reset the database? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down postgres; \
		docker volume rm pharmafinder_postgres_data 2>/dev/null || true; \
		docker-compose up -d postgres; \
		sleep 10; \
		make db-init; \
		echo "✅ Database reset completed!"; \
	else \
		echo "❌ Database reset cancelled"; \
	fi

db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U pharma_user pharmafinder_db > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created in backups/ directory"

db-shell:
	@echo "🐚 Opening database shell..."
	docker-compose exec postgres psql -U pharma_user -d pharmafinder_db

db-migrate:
	@echo "🔄 Running database migrations..."
	cd backend && alembic upgrade head
	@echo "✅ Migrations completed!"

# Testing
test:
	@echo "🧪 Running all tests..."
	make test-backend
	make test-frontend
	@echo "✅ All tests completed!"

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && python -m pytest tests/ -v
	@echo "✅ Backend tests completed!"

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test
	@echo "✅ Frontend tests completed!"

lint:
	@echo "🔍 Running linting..."
	@echo "Linting backend..."
	cd backend && python -m flake8 app/
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "✅ Linting completed!"

type-check:
	@echo "📝 Running type checking..."
	cd frontend && npm run type-check
	@echo "✅ Type checking completed!"

# Production Deployment
deploy-dev:
	@echo "🚀 Deploying to development environment..."
	git pull origin main
	docker-compose -f docker-compose.yml build
	docker-compose -f docker-compose.yml up -d
	@echo "✅ Development deployment completed!"

deploy-prod:
	@echo "🚀 Deploying to production environment..."
	@echo "⚠️  Make sure you have proper SSL certificates!"
	git pull origin main
	docker-compose -f docker-compose.yml --profile production build
	docker-compose -f docker-compose.yml --profile production up -d
	@echo "✅ Production deployment completed!"
	@echo "🌐 Website: https://pharmafinder.tg"

# Environment setup
setup-env:
	@echo "⚙️ Setting up environment files..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "📝 Created backend/.env from example"; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		cp frontend/.env.local.example frontend/.env.local; \
		echo "📝 Created frontend/.env.local from example"; \
	fi
	@echo "⚠️  Please update the environment files with your actual values!"

# SSL Certificate setup (for production)
setup-ssl:
	@echo "🔒 Setting up SSL certificates..."
	@mkdir -p nginx/ssl
	@echo "⚠️  Please place your SSL certificates in nginx/ssl/"
	@echo "   - pharmafinder.tg.crt"
	@echo "   - pharmafinder.tg.key"

# Health checks
health:
	@echo "🏥 Checking service health..."
	@echo "Backend API:"
	@curl -f http://localhost:8000/health 2>/dev/null && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
	@echo "Frontend:"
	@curl -f http://localhost:3000 2>/dev/null && echo "✅ Frontend healthy" || echo "❌ Frontend unhealthy"
	@echo "Database:"
	@docker-compose exec postgres pg_isready -U pharma_user -d pharmafinder_db && echo "✅ Database healthy" || echo "❌ Database unhealthy"

# Monitoring
stats:
	@echo "📊 Service Statistics:"
	docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Quick development setup
dev-setup: setup-env install build start
	@echo "🎉 Development environment is ready!"
	@echo "🌐 Frontend: http://localhost:3001 (ou 3000 si disponible)"
	@echo "🔧 Backend API: http://localhost:8000"
	@echo "📖 API Docs: http://localhost:8000/docs"

# Production setup (requires manual SSL setup)
prod-setup: setup-env setup-ssl deploy-prod
	@echo "🎉 Production environment deployed!"
	@echo "⚠️  Don't forget to configure your DNS to point to this server!"