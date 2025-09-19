from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.interfaces.api.routers import auth, users, admin, raster
from app.infrastructure.db.session import engine
from app.infrastructure.db.models import Base

from fastapi.staticfiles import StaticFiles
from pathlib import Path


app = FastAPI()

# Resolve absolute path to project root and geojson directory to avoid CWD issues
PROJECT_ROOT = Path(__file__).resolve().parents[3]
GEOJSON_DIR = PROJECT_ROOT / "geojson_exports"

app.mount("/geojson", StaticFiles(directory=str(GEOJSON_DIR), check_dir=True), name="geojson")

#Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["WWW-Authenticate", "Authorization"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(raster.router)


@app.get("/")
async def root():
    return {
        "message": "FastAPI OAuth Demo with User Registration and Roles",
        "endpoints": {
            "docs": "/docs",
            "register": "/register",
            "login": "/token",
            "google_login": "/auth/google",
            "user_profile": "/users/me",
            "admin_endpoints": {
                "create_user": "/admin/users",
                "list_users": "/admin/users",
                "delete_user": "/admin/users/{user_id}",
                "update_role": "/admin/users/{user_id}/role",
            },
            "raster_endpoints": {
                "get_all_rasters": "/raster/",
                "get_raster_summary": "/raster/summary",
                "get_raster_by_year": "/raster/{year}",
                "get_available_years": "/raster/years/list",
            },
        },
        "roles": {
            "admin": "Can create, read, update, delete users",
            "user": "Can only view their own profile and data",
        },
    }


@app.get("/geojson/_debug")
async def geojson_debug():
    try:
        entries = []
        if GEOJSON_DIR.exists():
            for p in sorted(GEOJSON_DIR.glob("*.geojson"))[:20]:
                entries.append({
                    "name": p.name,
                    "size_bytes": p.stat().st_size,
                })
        return {
            "geojson_dir": str(GEOJSON_DIR),
            "exists": GEOJSON_DIR.exists(),
            "count": len(entries),
            "entries": entries,
        }
    except Exception as exc:
        return {"geojson_dir": str(GEOJSON_DIR), "error": str(exc)}



# Add no-cache headers for static geojson to avoid stale data
from starlette.requests import Request

@app.middleware("http")
async def no_cache_geojson(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/geojson/"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response