# Backend Setup (FastAPI + PostgreSQL + GIS)

This backend uses **FastAPI** as the web framework, **Uvicorn** as the ASGI server, **SQLAlchemy** for ORM/database access, **PostgreSQL** as the database, and GIS libraries like **Rasterio** for geospatial processing.

---

## 🚀 Prerequisites
- Python 3.12+
- PostgreSQL (installed and running)
- (Optional but recommended) `conda` or `venv` for virtual environments

---

## 📦 Install Dependencies

Run these commands to install required packages:

### Core FastAPI + Server
```bash
pip install fastapi
pip install "uvicorn[standard]"

Database + ORM
pip install sqlalchemy
pip install psycopg2-binary   # PostgreSQL driver

Authentication / Security
pip install "python-jose[cryptography]"
pip install "passlib[bcrypt]"
pip install python-multipart


Data Processing

pip install numpy
pip install pandas

GIS / Geospatial
pip install rasterio
pip install gdal

Run the App
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

# 🚀 Frontend Setup Guide (Vite + React + Tailwind)

This project uses **Vite** as the build tool, **React** for UI, **TailwindCSS** for styling, **React Router** for routing, **Axios** for API calls, and **TanStack Table** for data grids.

---

## ⚙️ Prerequisites
- [Node.js](https://nodejs.org/) (>= 18.x recommended)  
- npm (comes with Node)

---

## 📦 Installation & Setup

Run the following commands **inside the `frontend` folder**.

### 1️⃣ Install Core Dependencies

```bash
# React Core
npm install --force react
npm install --force react-dom

# Router
npm install --force react-router-dom
npm install -D --force @types/react-router-dom

# HTTP Client
npm install --force axios
npm install -D --force @types/axios

# Table Library
npm install --force @tanstack/react-table

# TailwindCSS + PostCSS stack
npm install --force tailwindcss
npm install --force postcss
npm install --force autoprefixer

# Vite React Plugin
npm install --force @vitejs/plugin-react

# TypeScript + Types (if using .tsx)
npm install -D --force typescript
npm install -D --force @types/react
npm install -D --force @types/react-dom

# Initialize TailwindCSS
npx tailwindcss init -p

# Run Development Server
npm run dev
```


