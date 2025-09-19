## ml_prediction — Setup and Run Guide (Windows)

This project includes a FastAPI backend and a Vite + React frontend. Follow the steps below to install dependencies, configure the environment, run database migrations, and start both services.

### Prerequisites
- **Python** 3.11+
- **Node.js** 18+ (or 20+) and **npm** 9+
- **PostgreSQL** 14+ (local user with created DB)
- **Git**

### 1) Clone and enter the project
```powershell
git clone <your-repo-url> ml_prediction
cd ml_prediction
```

### 2) Backend (FastAPI) — install Python dependencies
Create a virtual environment and install packages.
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install fastapi uvicorn[standard] python-dotenv SQLAlchemy alembic psycopg2-binary passlib[bcrypt] python-jose[cryptography] httpx pydantic numpy rasterio
```

If `rasterio` fails to build on Windows, either:
- Install a prebuilt wheel from `https://www.lfd.uci.edu/~gohlke/pythonlibs/`, or
- Try: `pip install rasterio==1.3.10`

### 3) Configure environment (.env)
Create a `.env` file in the project root (same folder as `main.py`).
```
# JWT
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (PostgreSQL)
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/fastapi_backend

# Optional Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback

# Optional Postgres conn parts for scripts
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=fastapi_backend
```

### 4) Database setup and migrations
Create the database in PostgreSQL (example shown for psql):
```sql
CREATE DATABASE fastapi_backend;
```
Then apply Alembic migrations:
```powershell
alembic upgrade head
```

### 5) Optional seeding utilities
Run any of the following if you need demo data or generated files:
```powershell
python .\scripts\seed_shapefiles.py
python .\scripts\seed_rasters_auto.py
python .\scripts\export_lulc_geojson.py
```

### 6) Start the backend (FastAPI)
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
FastAPI docs: `http://127.0.0.1:8000/docs`

### 7) Frontend (Vite + React) — install and run
```powershell
cd .\frontend
npm ci
npm run dev
```
The dev server URL will be shown in the console (usually `http://127.0.0.1:5173`).

### Notes
- The backend statically serves GeoJSON files from `/geojson` mapped to the `geojson_exports` directory.
- CORS is configured to allow requests from `localhost` and `127.0.0.1` on any port.
- If you need to change DB credentials or ports, update them in `.env` and re-run services.

### Dependency Reference
- Backend (pip): `fastapi`, `uvicorn[standard]`, `python-dotenv`, `SQLAlchemy`, `alembic`, `psycopg2-binary`, `passlib[bcrypt]`, `python-jose[cryptography]`, `httpx`, `pydantic`, `numpy`, `rasterio`.
- Frontend: Managed by `frontend/package.json` (React 19, Vite, TypeScript, Tailwind CSS 4, Radix UI, Leaflet, React-Leaflet, etc.). Use `npm ci` to install.


