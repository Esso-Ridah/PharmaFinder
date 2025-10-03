from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.config import settings
from app.routers import auth, products, pharmacies, orders, categories, partner_analytics, cart, prescriptions, notifications, vision, addresses, payments

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    PharmaFinder API - Plateforme de référencement des pharmacies en Afrique de l'Ouest
    
    ## Fonctionnalités principales:
    
    * **Authentification** - Inscription/connexion des utilisateurs
    * **Pharmacies** - Gestion et recherche des pharmacies
    * * **Produits** - Recherche et disponibilité des médicaments
    * **Commandes** - Gestion des commandes avec click & collect ou livraison
    * **Prescriptions** - Upload et validation des ordonnances médicales
    
    ## Utilisateurs types:
    
    * **Clients** - Recherche et achat de médicaments
    * **Pharmaciens** - Gestion de leur pharmacie et commandes
    * **Administrateurs** - Supervision de la plateforme
    """,
    contact={
        "name": "PharmaFinder Support",
        "email": "support@pharmafinder.tg",
    },
    license_info={
        "name": "MIT License",
    },
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted hosts middleware (security)
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["pharmafinder.tg", "*.pharmafinder.tg", "localhost", "127.0.0.1"]
    )

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(pharmacies.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(addresses.router)
app.include_router(payments.router)
app.include_router(prescriptions.router)
app.include_router(notifications.router)
app.include_router(partner_analytics.router)
app.include_router(vision.router)


# Health check endpoint
@app.get("/", tags=["health"])
async def root():
    """Health check endpoint"""
    return {
        "message": "PharmaFinder API is running",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "database": "connected",  # TODO: Add actual DB health check
        "timestamp": "2024-01-01T00:00:00Z"  # TODO: Add actual timestamp
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    if settings.DEBUG:
        # In debug mode, show full error details
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": str(exc),
                "type": type(exc).__name__
            }
        )
    else:
        # In production, show generic error message
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": "An unexpected error occurred"
            }
        )


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    import asyncio
    from app.background_tasks import background_task_manager

    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting up...")
    print(f"📊 Debug mode: {settings.DEBUG}")

    # TODO: Initialize database connection pool
    # TODO: Initialize Redis connection
    # TODO: Load system configuration

    # Start background tasks
    print("⏰ Starting prescription timeout monitor...")
    asyncio.create_task(background_task_manager.start_timeout_monitor())

    print("✅ Startup completed successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    from app.background_tasks import background_task_manager

    print("🛑 Shutting down PharmaFinder API...")

    # Stop background tasks
    background_task_manager.stop_timeout_monitor()

    # TODO: Close database connections
    # TODO: Close Redis connections

    print("✅ Shutdown completed successfully")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        log_level="info"
    )