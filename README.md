# 🌍 Land Use / Land Cover (LULC) Analysis Platform  

## 🔧 Backend Setup (FastAPI + PostgreSQL + GIS)  
This backend uses **FastAPI** as the web framework, **Uvicorn** as the ASGI server, **SQLAlchemy** for ORM/database access, **PostgreSQL** as the database, and GIS libraries like **Rasterio** for geospatial processing.  

### 🚀 Prerequisites  
- Python **3.12+**  
- PostgreSQL (installed and running)  
- (Optional but recommended) conda or venv for virtual environments  


## ⚙️ Installation  

### 1️⃣ Clone the repository  
```bash
git clone https://github.com/UmarAzamQureshi/Land_Change_Analysis.git
cd Land_Change_Analysis
```

### 📦 Install Dependencies  


## Install dependencies
### Option A: Install using requirements.txt
```bash
pip install -r requirements.txt
```

### Option B:Manual
#### Core FastAPI + Server  
```bash
pip install fastapi
pip install "uvicorn[standard]"
```

## Database + ORM
```bash
pip install sqlalchemy
pip install psycopg2-binary   # PostgreSQL driver
```
## Authentication / Security
```bash
pip install "python-jose[cryptography]"
pip install "passlib[bcrypt]"
pip install python-multipart
```

## Data Processing
```bash
pip install numpy
pip install pandas
```


## GIS / Geospatial
```bash
pip install rasterio
pip install gdal
```



## Run the App 
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## requirements.txt

- fastapi
- "uvicorn[standard]"
- sqlalchemy
- psycopg2-binary
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart
- numpy
- pandas
- rasterio
- gdal





## 🎨Frontend Setup Guide (Vite + React + Tailwind)

- Frontend stack:

- Vite → build tool

- React → UI

- TailwindCSS → styling

- React Router → routing

- Axios → API calls

- TanStack Table → data grids

## ⚙️ Prerequisites

- Node.js (>= 18.x)

- npm (comes with Node)

## 📦 Installation & Setup

- Run the following inside the frontend/ folder:


# Install Core Dependencies

## React Core
```bash
npm install --force react
npm install --force react-dom
```
## Router
```bash
npm install --force react-router-dom
npm install -D --force @types/react-router-dom
```
## HTTP Client
```bash
npm install --force axios
npm install -D --force @types/axios
```
## Table Library
```bash
npm install --force @tanstack/react-table
```
## TailwindCSS + PostCSS stack
```bash
npm install --force tailwindcss
npm install --force postcss
npm install --force autoprefixer
```
## Vite React Plugin
```bash
npm install --force @vitejs/plugin-react
```
## TypeScript + Types (if using .tsx)
```bash
npm install -D --force typescript
npm install -D --force @types/react
npm install -D --force @types/react-dom
```
## Initialize TailwindCSS
```bash
npx tailwindcss init -p
```
## Run Development Server
```bash
npm run dev
```

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

## Project Images

- <img width="933" height="411" alt="Screenshot 2025-09-22 184950" src="https://github.com/user-attachments/assets/a43e7eff-fd97-48c1-9a19-f5ab01ec18b1" />
- <img width="916" height="296" alt="Screenshot 2025-09-22 185019" src="https://github.com/user-attachments/assets/12ec8d63-1991-428e-ab2b-bfd7fe6ec683" />
- <img width="926" height="291" alt="Screenshot 2025-09-22 185040" src="https://github.com/user-attachments/assets/54bb73bc-cb1a-4673-8efa-db1b258d9dc3" />
- <img width="925" height="296" alt="Screenshot 2025-09-22 185105" src="https://github.com/user-attachments/assets/31083a6f-f982-4f1e-965a-fad1f57f5f2f" />
- <img width="930" height="286" alt="Screenshot 2025-09-22 185125" src="https://github.com/user-attachments/assets/cbc82b62-324b-47a1-995c-1c64d91c4b6d" />





