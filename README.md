# AI-Powered Dynamic Air Operations & Resource Optimisation Simulator

> **Smart India Hackathon (SIH) 2026**  
> **Problem Statement ID:** SIH26250  
> **Domain:** Air Power - Dynamic Air Operations & Resource Optimisation  
> **Disclaimer:** This project is an academic decision-support and simulation tool built exclusively with **synthetic, fictitious data**. It does not model, represent, or connect to any real-world military installations, tactical operations, weapon systems, or operational data.

---

## 🛰️ Project Overview

The **AI-Powered Dynamic Air Operations & Resource Optimisation Simulator** is an intelligent decision-support system designed to solve complex air fleet scheduling, operational constraint matching, and real-time disruption handling under dynamic multi-domain conditions.

The system combines:
1. **Interactive Operations Command Center UI** for situational awareness, asset telemetry, and mission monitoring.
2. **FastAPI & PostgreSQL Backend (Phase 2)** with SQLAlchemy 2.x, Alembic schema migrations, and REST CRUD services.
3. **Operations Research Engine (Google OR-Tools CP-SAT - Upcoming Phase)** for multi-objective constraint satisfaction (flight crew resting, fuel thresholds, maintenance turnaround, weather avoidance).
4. **Machine Learning Pipeline (Scikit-Learn - Upcoming Phase)** for predictive asset availability and turnaround forecasting.
5. **Dynamic Re-planning Simulator** to handle real-time injects (asset failures, runway closures, priority overrides, weather disruptions) in sub-2-second response times.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────┐
                    │        React + Vite + TypeScript        │
                    │   Tactical Command-Center Interface    │
                    │ (Tailwind CSS, Lucide Icons, Recharts) │
                    └───────────────────┬────────────────────┘
                                        │ REST APIs
                                        ▼
                    ┌────────────────────────────────────────┐
                    │            FastAPI Backend             │
                    │   - Mission Dispatcher & Validation    │
                    │   - Resource Telemetry Management      │
                    │   - Disruption Simulation Engine       │
                    └───────┬────────────────────────┬───────┘
                            │                        │
                            ▼                        ▼
       ┌──────────────────────────────┐    ┌───────────────────────────┐
       │   Google OR-Tools (CP-SAT)   │    │  scikit-learn Predictor   │
       │   - Mission-Resource Matcher │    │  - Asset Readiness Model  │
       │   - Multi-Constraint Solver  │    │  - Delay & Weather Risk   │
       └──────────────────────────────┘    └───────────────────────────┘
                            │
                            ▼
       ┌──────────────────────────────┐
       │     PostgreSQL Database      │
       │ (Missions, Resources, Sched) │
       └──────────────────────────────┘
```

---

## 📂 Project Structure

```
.
├── docker-compose.yml          # Container configuration for full stack
├── README.md                   # Documentation & Setup Guide
├── UIIIII.png                  # Command Center UI Design Specification
├── backend/                    # FastAPI Backend Service
│   ├── Dockerfile              # Python 3.11 container definition
│   ├── requirements.txt        # FastAPI, SQLAlchemy, Alembic, psycopg2
│   ├── alembic.ini             # Alembic configuration
│   ├── alembic/                # Database migrations
│   │   ├── env.py
│   │   └── versions/           # Migration revision scripts
│   ├── test_api_endpoints.py   # Automated test suite for all endpoints
│   └── app/
│       ├── main.py             # FastAPI entrypoint & router assembly
│       ├── database.py         # SQLAlchemy engine & session factory
│       ├── models/             # Database ORM models
│       │   ├── mission.py
│       │   ├── resource.py
│       │   ├── schedule.py
│       │   └── simulation_event.py
│       ├── schemas/            # Pydantic validation schemas
│       │   ├── mission.py
│       │   ├── resource.py
│       │   ├── schedule.py
│       │   └── simulation_event.py
│       ├── routers/            # API Route handlers
│       │   ├── missions.py     # CRUD /api/missions
│       │   ├── resources.py    # CRUD /api/resources
│       │   ├── schedules.py    # GET /api/schedules
│       │   └── simulation.py   # GET/POST /api/simulation/events
│       └── services/
│           └── seed_data.py    # 15 missions & 30 resources synthetic seeder
└── frontend/                   # React + TypeScript + Vite UI
    ├── Dockerfile              # Multi-stage Nginx container
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx             # Main dashboard navigation shell
        ├── index.css           # Command center styling & animations
        ├── services/
        │   └── api.ts          # Centralized API service layer
        ├── components/         # Reusable tactical UI components
        │   ├── Header.tsx      # Top status bar & live simulation clock
        │   ├── Sidebar.tsx     # Command center navigation
        │   ├── TacticalMap.tsx # Operations visualization canvas
        │   ├── StatCard.tsx    # Telemetry KPI cards
        │   ├── OptimizationModal.tsx
        │   └── DisruptionModal.tsx
        ├── pages/              # Module screens
        │   ├── Dashboard.tsx   # Live metrics & situational awareness
        │   ├── Missions.tsx    # Mission management & scheduling CRUD
        │   ├── Resources.tsx   # Fleet & asset readiness telemetry CRUD
        │   ├── Optimization.tsx# CP-SAT solver control & schedule
        │   ├── Simulation.tsx  # Dynamic disruption inject & re-planner
        │   ├── Analytics.tsx   # Performance comparison & KPIs
        │   ├── Reports.tsx     # Audit & mission log downloads
        │   └── Settings.tsx    # Hyperparameters & data safety
        └── types/              # TypeScript interface definitions
```

---

## 🗄️ Database Models (SQLAlchemy 2.x)

1. **Mission** (`missions`):
   - `id`: Primary key (autoincrement integer)
   - `mission_code`: Unique identifier (e.g., `M001`)
   - `name`: Mission name (e.g., `Reconnaissance Alpha`)
   - `priority`: `HIGH` / `MEDIUM` / `LOW`
   - `zone`: `ZONE_A` / `ZONE_B` / `ZONE_C` / `ZONE_D`
   - `duration_minutes`: Sortie duration
   - `start_window` & `end_window`: Timestamp time windows
   - `required_resource_type`: `TYPE_A` / `TYPE_B` / `TYPE_C`
   - `required_resource_count`: Asset count needed
   - `status`: `PENDING` / `SCHEDULED` / `ACTIVE` / `COMPLETED` / `DELAYED`
   - `created_at`: Server timestamp

2. **Resource** (`resources`):
   - `id`: Primary key (autoincrement integer)
   - `resource_code`: Unique asset identifier (e.g., `A01`)
   - `resource_type`: `TYPE_A` / `TYPE_B` / `TYPE_C`
   - `capacity`: Payload capacity
   - `availability_status`: `AVAILABLE` / `IN_MISSION` / `UNAVAILABLE` / `MAINTENANCE`
   - `fuel_level`: 0–100%
   - `maintenance_status`: `NORMAL` / `ATTENTION` / `MAINTENANCE`
   - `operating_hours`: Total flight hours
   - `current_zone`: Current geographical sector
   - `home_base`: `BASE_1` / `BASE_2` / `BASE_3` / `BASE_4`
   - `predicted_availability`: Machine learning readiness score (0–100%)
   - `created_at`: Server timestamp

3. **Schedule** (`schedules`):
   - `id`: Primary key
   - `mission_id`: Foreign key to `missions.id`
   - `resource_id`: Foreign key to `resources.id`
   - `start_time` & `end_time`: Allocation interval
   - `delay_minutes`: Latency delta
   - `optimization_score`: Constraint solver score
   - `status`: `SCHEDULED` / `ACTIVE` / `COMPLETED` / `CANCELLED`

4. **SimulationEvent** (`simulation_events`):
   - `id`: Primary key
   - `event_type`: Event class (e.g., `RESOURCE_UNAVAILABLE`, `WEATHER_DISRUPTION`)
   - `affected_resource_id`: Foreign key to `resources.id` (nullable)
   - `affected_mission_id`: Foreign key to `missions.id` (nullable)
   - `severity`: `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`
   - `description`: Textual inject details

---

## 📡 Backend API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service and database connectivity status |
| **Missions** | `GET` | `/api/missions` | List missions with search, priority, status filters |
| | `GET` | `/api/missions/{id}` | Get mission details by ID |
| | `POST` | `/api/missions` | Create a new synthetic mission |
| | `PUT` | `/api/missions/{id}` | Update existing mission details |
| | `DELETE` | `/api/missions/{id}` | Remove mission |
| **Resources** | `GET` | `/api/resources` | List resources with search, type, status filters |
| | `GET` | `/api/resources/{id}` | Get resource telemetry by ID |
| | `POST` | `/api/resources` | Add new synthetic aircraft |
| | `PUT` | `/api/resources/{id}` | Update resource status/fuel |
| | `DELETE` | `/api/resources/{id}` | Decommission resource |
| **Schedules** | `GET` | `/api/schedules` | List active mission-resource allocations |
| | `GET` | `/api/schedules/{id}` | Get schedule entry by ID |
| **Simulation** | `GET` | `/api/simulation/events` | List dynamic disruption events feed |
| | `POST` | `/api/simulation/events` | Inject new disruption and update asset state |
| **Seed** | `POST` | `/api/seed` | Trigger synthetic seeding (15 missions, 30 assets) |

---

## 🚀 Running the Full Stack

### Option 1: Docker Compose (All Services Together)

```bash
docker-compose up --build
```
- **Frontend Command Center:** `http://localhost:5173`
- **FastAPI Interactive Docs:** `http://localhost:8000/docs`
- **PostgreSQL Database:** `localhost:5432` (db: `airops_db`, user: `airops_user`)

### Option 2: Local Development Execution

#### 1. Start Backend:
```bash
cd backend
# Create virtual environment if needed
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt

# Run migrations
.\venv\Scripts\alembic upgrade head

# Start FastAPI
.\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

#### 3. Run Automated Backend Test Suite:
```bash
cd backend
.\venv\Scripts\python test_api_endpoints.py
```
*(All 15 endpoints verified with 100% pass rate)*
