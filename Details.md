# Architecture and API Overview

## Why this architecture
- We use a layered, port-and-adapter (Clean/Hexagonal) architecture for clear separation of concerns:
  - `domain`: core entities and value objects
  - `application`: use cases and ports (interfaces)
  - `infrastructure`: concrete adapters (DB, OAuth, security)
  - `interfaces`: HTTP API (FastAPI), dependency wiring, schemas
- This enables testability, maintainability, and swapping infrastructure (DB, auth provider) without touching business logic.

## High-level Architecture
- Backend: FastAPI with JWT auth and Google OAuth; domain-driven layering:
  - `app/domain`: `User` entity; `UserRole` enum
  - `app/application/ports`: `UserRepository`, `PasswordHasher`, `TokenProvider`, `OAuthProvider`
  - `app/application/use_cases`: `register_user`, `login_user`, `admin_user_ops`
  - `app/infrastructure`:
    - `db`: SQLAlchemy models/repository for users; direct psycopg2 for PostGIS raster ops
    - `security`: `JoseJWT`, `PasslibPasswordHasher`
    - `oauth`: Google OAuth via httpx
  - `app/interfaces`:
    - `api/fastapi_app.py`: app assembly, CORS, static mount for GeoJSON
    - `api/routers`: `auth`, `users`, `admin`, `raster`
    - `schemas`: Pydantic models for request/response
    - `dependencies`: DI providers, role guards, token decoding
- Frontend: Vite + React (Inertia-ready) + Tailwind UI patterns
  - Focus component: `frontend/src/components/mapanalysis.tsx` uses Leaflet for mapping and Nivo for Sankey.

## Best practices followed
- Clear layering with ports/use-cases decoupling business logic from frameworks.
- Dependency Injection via FastAPI `Depends` for repositories, token provider, and hasher.
- Pydantic schemas for all request/response validation and typing.
- Role-based access control (admin guard) and JWT-based authentication.
- OAuth 2.0 login flow (Google) isolated behind `OAuthProvider`.
- Soft-delete mixin in SQLAlchemy model for safer user removals.
- Environment-driven configuration via `.env` and centralized `settings`.
- CORS restricted to localhost dev hosts.
- Static GeoJSON mounted under `/geojson` with explicit no-cache middleware to avoid stale data.
- Raster endpoints use PostGIS-native functions for performance (server-side computation).
- Response consistency: JSON across all endpoints.

## What we are achieving
- Secure user management with local and Google OAuth login.
- Admin operations for user lifecycle (create/list/delete/restore/update role).
- End-to-end geospatial analytics for LULC (Land Use/Land Cover):
  - Summaries by year (metadata, band stats, extents).
  - Class distributions and percentages from rasters.
  - Vectorized polygons per class and per year for web mapping.
  - Multi-year class change visualization (Sankey) in the frontend.
  - Fast, cache-safe delivery of precomputed GeoJSON overlays.

## Database choice and rationale
- Database: PostgreSQL with PostGIS (see `settings.DATABASE_URL`, `POSTGRES_*` and direct `psycopg2` usage).
- Why PostGIS:
  - Native raster functions: `ST_ValueCount`, `ST_MetaData`, `ST_NumBands`, `ST_SRID`, `ST_DumpAsPolygons`, `ST_Transform`, `ST_AsGeoJSON`, etc.
  - Efficient server-side spatial processing and vectorization.
  - Simplifies generating class counts, extents, and GeoJSON for the map.
- SQLAlchemy is used for user/account data; `psycopg2` is used for high-performance raster queries.

## Backend endpoints

- Root
  - GET `/` — App info and endpoint index.

- Auth (`app/interfaces/api/routers/auth.py`)
  - POST `/register` — Create user (local), returns `UserResponse`.
  - POST `/token` — Login (password), returns JWT `Token`.
  - GET `/auth/google` — Start Google OAuth (302 redirect).
  - GET `/auth/google/callback` — Handle Google callback; returns token and user info.

- Users (`app/interfaces/api/routers/users.py`)
  - GET `/users/me` — Current user profile (`UserResponse`).
  - GET `/users/me/items` — Sample user items list.
  - GET `/users/profile` — Current user profile (raw dict).
  - DELETE `/users/{user_id}` — Soft delete user (admin ops).
  - POST `/users/{user_id}/restore` — Restore soft-deleted user.
  - GET `/users/deleted` — List soft-deleted users.

- Admin (requires admin; `app/interfaces/api/routers/admin.py`)
  - POST `/admin/users` — Create user (admin).
  - GET `/admin/users` — List users (pagination).
  - DELETE `/admin/users/{user_id}` — Hard delete user.
  - PUT `/admin/users/{user_id}/role` — Update user role.

- Raster and LULC analytics (`app/interfaces/api/routers/raster.py`)
  - GET `/raster/summary` — Count datasets, years, tiles; coarse consistency checks.
  - GET `/raster/{year}` — Detailed raster info: metadata, bands, extent, tile count.
  - GET `/raster/{year}/class-counts` — PostGIS-driven pixel counts per class with percentages.
  - GET `/raster/{year}/ST_ValueCount` — Raw distinct raster values (debug/inspection).
  - GET `/raster/{year}/overlay.geojson` — Generic FeatureCollection dump of table geometry.
  - GET `/raster/{year}/summary` — Combined LULC summary: AOI geometry + classes with counts/percentages + meta.
  - GET `/raster/{year}/classes-geojson` — Vectorized polygons per class (precomputes `lulc_classes_{year}` if missing).
  - GET `/raster/all-years/classes-geojson` — Multi-year class polygons as `{year: FeatureCollection}`.

- Static GeoJSON (mounted in `fastapi_app.py`)
  - GET `/geojson/lulc_classes_{year}.geojson` — Pre-exported class polygons by year.
  - GET `/geojson/pakistan.geojson` — Pakistan boundary for map frame.
  - GET `/geojson/class_changes.geojson` — Edges for class transitions (used by Sankey).
  - GET `/geojson/_debug` — Quick listing and sizes of served files.

## Frontend `MapAnalysis` overview (`frontend/src/components/mapanalysis.tsx`)
- Data loading
  - On mount, fetches:
    - Yearly LULC class GeoJSONs from `/geojson/lulc_classes_{year}.geojson`.
    - Pakistan boundary `/geojson/pakistan.geojson`.
    - Class changes `/geojson/class_changes.geojson`.
  - Disables cache via query busting and server no-cache headers.
- Map
  - Leaflet `MapContainer` with OSM tiles.
  - Overlays:
    - Boundary (`pakistan.geojson`)
    - Selected year’s class polygons styled by LULC code.
  - Interactive controls:
    - Custom InfoControl (hover to view class label/code).
    - Legend with collapsible UI; colors by class.
    - Zoom and reset buttons; mobile-friendly access to map instance.
- Time slider
  - Year selector centered at bottom; dynamic positioning based on chart panel height.
- Sankey chart
  - Processes `class_changes.geojson`, aggregates transitions, removes cycles, renders with `@nivo/sankey`.
  - Toggle panel to save map viewport space.
- UX hardening
  - Loading and error overlays.
  - Mobile/desktop responsive UI; theme toggle.

## Notable implementation details
- Soft delete for users via `SoftDeleteMixin`; admin restore endpoint included.
- JWT via `OAuth2PasswordBearer(tokenUrl="/token")`; token decoded in `get_current_user`.
- Admin guard (`require_admin`) wraps admin router.
- Precomputation pattern for `classes-geojson` to speed up repeated requests; tables like `lulc_classes_{year}` and `lulc_classes_all_years`.
- Geometry simplification (`ST_SimplifyPreserveTopology`) and `ST_AsGeoJSON` for efficient web display.
- Estimation of area from pixel size in degrees (with deg→m² approximation) when needed.

## Configuration
- `.env` driven settings (`app/config/settings.py`):
  - `DATABASE_URL`, `POSTGRES_*` for PostGIS access.
  - `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`.
  - Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- CORS: allows localhost dev origins and common headers/methods.
- Static files: `/geojson` served from project `geojson_exports` directory.

## Summary
- **Architecture**: Clean/Hexagonal with FastAPI adapters and strong separation of concerns.
- **Best practices**: DI, Pydantic schemas, RBAC, OAuth2/JWT, soft delete, env-based config, CORS, cache control, PostGIS-first raster analytics.
- **Outcome**: Secure user/admin features plus performant, server-driven geospatial analytics powering an interactive Leaflet + Sankey frontend.
