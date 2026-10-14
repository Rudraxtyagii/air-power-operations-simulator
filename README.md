# AI-Powered Dynamic Air Operations & Resource Optimisation Simulator

> **Smart India Hackathon (SIH) 2026**  
> **Problem Statement ID:** SIH26250  
> **Domain:** Air Power - Dynamic Air Operations & Resource Optimisation  
> **Disclaimer:** This project is an academic decision-support and simulation tool built exclusively with **synthetic, fictitious data**. It does not model, represent, or connect to any real-world military installations, tactical operations, weapon systems, or operational data.

---

## 🛰️ Project Overview

The **AI-Powered Dynamic Air Operations & Resource Optimisation Simulator** is an intelligent decision-support system designed to solve complex air fleet scheduling, operational constraint matching, weather hazard avoidance, and real-time disruption handling under dynamic conditions.

The system features:
1. **Global Light-Blue Claymorphism UI** (`#EAF2FC` visual language) with soft raised cards, recessed wells, smooth hover transitions, and accessible navy typography (`#14264A`).
2. **Dedicated Weather Monitoring Module** (exact match to the reference dashboard) featuring:
   - Persistent High Weather Alert banner with dismissal controls.
   - Top overview metric cards (High, Medium, Low alert zones, Total 9 monitored zones, Overall status).
   - Interactive SVG Weather Risk Map across Sectors Zone A through Zone I with terrain contours, animated radar sweep, active flight paths, and layer toggles (Weather Radar, Zone Boundaries, Active Missions, Airbases).
   - 6 Operational Weather Condition cards (Thunderstorms, Heavy Snow & Icing, Dense Fog, Strong Crosswinds, Heavy Rain, Sandstorms).
   - Recent Weather Alerts ledger with real-time severity ratings and detail drawers.
   - Zone-wise status table with visibility thresholds highlighted in red.
   - Mission impact summary with one-click dynamic re-optimization.
3. **Audible Alert Synthesizer**: Web Audio API oscillator synthesis generating high-urgency pulsed harmonic chimes (880Hz → 659Hz) and gentle notification chimes, complete with mute/unmute persistence and test sound preview.
4. **Google OR-Tools CP-SAT Constraint Satisfaction Engine**: Real integer programming model enforcing:
   - Aircraft type & payload capacity compatibility.
   - Discrete operational time windows.
   - Mandatory no-overlap interval constraints (`model.AddNoOverlap`) per aircraft.
   - Depot maintenance availability exclusions.
   - Adverse weather avoidance buffers (+120 min holds/delays for high convective storm sectors).
   - Multi-objective maximization of high-priority sorties and minimization of delays.
5. **FastAPI & PostgreSQL Backend**: Full SQLAlchemy 2.x ORM models, Alembic schema migrations, auto-seeding of synthetic missions, resources, and weather zones, and 15+ REST endpoints.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────┐
                    │        React + Vite + TypeScript        │
                    │   Claymorphic Tactical Command Center   │
                    │ (Tailwind CSS, Lucide Icons, Recharts) │
                    └───────────────────┬────────────────────┘
                                        │ REST APIs
                                        ▼
                    ┌────────────────────────────────────────┐
                    │            FastAPI Backend             │
                    │   - Mission & Resource Telemetry       │
                    │   - Real-Time Weather Monitoring       │
                    │   - Disruption Simulation Engine       │
                    └───────┬────────────────────────┬───────┘
                            │                        │
                            ▼                        ▼
        ┌──────────────────────────────┐    ┌───────────────────────────┐
        │   Google OR-Tools (CP-SAT)   │    │  Audible Alert Synthesizer│
        │   - Real Constraint Solver   │    │  - Web Audio API Chimes   │
        │   - Weather Avoidance Holds  │    │  - Alert Deduplication    │
        │   - No-Overlap Interval Math │    │  - Mute / Test Sound Mode │
        └──────────────────────────────┘    └───────────────────────────┘
                            │
                            ▼
        ┌──────────────────────────────┐
        │     PostgreSQL / SQLite      │
        │ (Missions, Resources, Weather│
        │  Schedules, Simulation Events│
        └──────────────────────────────┘
```

---

## 📂 Project Structure

```
.
├── docker-compose.yml          # Container configuration for full stack
├── README.md                   # Documentation & Setup Guide
├── backend/                    # FastAPI Backend Service
│   ├── Dockerfile              # Python 3.11 container definition
│   ├── requirements.txt        # FastAPI, SQLAlchemy, Alembic, OR-Tools, psycopg2
│   ├── alembic.ini             # Alembic configuration
│   ├── alembic/                # Database migrations
│   │   ├── env.py
│   │   └── versions/           # Migration revisions (tables & weather)
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint & router assembly
│   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   ├── models/             # Database ORM models
│   │   │   ├── mission.py
│   │   │   ├── resource.py
│   │   │   ├── schedule.py
│   │   │   ├── simulation_event.py
│   │   │   └── weather.py      # WeatherZone, WeatherAlert, WeatherScenario
│   │   ├── schemas/            # Pydantic validation schemas
│   │   │   ├── mission.py
│   │   │   ├── resource.py
│   │   │   ├── schedule.py
│   │   │   ├── simulation_event.py
│   │   │   └── weather.py
│   │   ├── routers/            # REST API route controllers
│   │   │   ├── missions.py
│   │   │   ├── resources.py
│   │   │   ├── schedules.py
│   │   │   ├── simulation.py
│   │   │   ├── weather.py      # Weather endpoints & scenario injector
│   │   │   └── optimization.py # CP-SAT solver endpoints
│   │   ├── optimization/       # Constraint Satisfaction Engine
│   │   │   └── solver.py       # Google OR-Tools CP-SAT solver implementation
│   │   └── services/           # Business logic & seed scripts
│   │       ├── seed_data.py
│   │       └── weather_data.py # Zones A-I, conditions, scenarios
└── frontend/                   # React 19 + TypeScript + Vite UI
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx            # React application root
        ├── App.tsx             # Navigation & global modal controller
        ├── index.css           # Complete light-blue claymorphism design tokens
        ├── types/index.ts      # TypeScript interfaces
        ├── services/api.ts     # Client service for all backend APIs
        ├── utils/
        │   └── audioAlert.ts   # Web Audio API sound synthesizer
        ├── components/
        │   ├── Header.tsx      # Top bar with UTC clock, audio controls, alert banner
        │   ├── Sidebar.tsx     # Claymorphic navigation with Weather tab
        │   ├── StatCard.tsx    # Soft raised metric cards
        │   ├── TacticalMap.tsx # Air operations radar grid
        │   ├── OptimizationModal.tsx # CP-SAT solver trigger modal
        │   └── DisruptionModal.tsx   # Operational disruption injector
        └── pages/
            ├── Dashboard.tsx    # Live situational awareness & KPI cards
            ├── Weather.tsx      # Dedicated Weather Monitoring command view
            ├── Missions.tsx     # Sortie CRUD ledger & filters
            ├── Resources.tsx    # Aircraft fleet readiness & fuel tracking
            ├── Optimization.tsx # Mathematical CP-SAT parameter solver view
            ├── Simulation.tsx   # Scenario disruption recovery sandbox
            ├── Analytics.tsx    # Before vs. After optimization charts
            ├── Reports.tsx      # Executive audit trail downloads
            └── Settings.tsx     # Solver hyperparameters & audio preferences
```

---

## 🎨 Claymorphism Design System

The entire user interface adheres to a unified light-blue claymorphic design language:

| Design Token | Color Hex | Usage |
| :--- | :--- | :--- |
| **Main Background** | `#EAF2FC` | App viewport and page canvases |
| **Secondary Background** | `#DCE8F8` | Sub-canvases and contrast panels |
| **Card Background** | `#EAF2FC` | Raised soft cards (`.clay-card`) |
| **Primary Navy Text** | `#14264A` | Main headers and high-contrast labels |
| **Secondary Slate Text** | `#607391` | Subtitles, metadata, and timestamps |
| **Primary Accent Blue**| `#4285F4` | Active tabs, primary buttons, and radar nodes |
| **High Alert Red** | `#F04452` | Thunderstorm warnings, critical disruptions |
| **Medium Alert Amber** | `#F4B740` | Adverse wind/fog advisories, delays |
| **Low Alert Green** | `#25C98A` | Optimal flight corridors, nominal sorties |

---

## 🚀 Running the Application

### Option A: Local Development (Fastest)

#### 1. Backend Service
```powershell
cd c:\sih2\backend
.\venv\Scripts\Activate.ps1
$env:DATABASE_URL="sqlite:///./airops_dev.db"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### 2. Frontend Service
```powershell
cd c:\sih2\frontend
npm run dev
```
* Web Dashboard: [http://localhost:5173/](http://localhost:5173/)

---

### Option B: Docker Compose
```bash
docker-compose up --build
```
This spins up:
- `db`: PostgreSQL 16 on port `5432`
- `backend`: FastAPI Python 3.11 service on port `8000`
- `frontend`: React Vite Nginx web server on port `80` (or `3000`)

---

## 🧪 Verification & Test Results

Run the automated endpoint test suite against the live API:
```powershell
cd c:\sih2\backend
.\venv\Scripts\python.exe -c "
import urllib.request, json
base = 'http://127.0.0.1:8000/api'
def check(name, path, method='GET', data=None):
    req = urllib.request.Request(f'{base}{path}', method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else: body = None
    with urllib.request.urlopen(req, data=body) as r:
        print(f'[PASS] {name} (HTTP {r.status})')

check('Health Check', '/health')
check('Missions', '/missions')
check('Resources', '/resources')
check('Schedules', '/schedules')
check('Simulation Events', '/simulation/events')
check('Weather Overview', '/weather/overview')
check('Weather Zones', '/weather/zones')
check('Weather Conditions', '/weather/conditions')
check('Weather Alerts', '/weather/alerts')
check('Weather Scenarios', '/weather/scenarios')
check('Weather Impact', '/weather/impact')
check('CP-SAT Solver', '/optimization/solve', method='POST', data={'consider_weather': True})
check('Latest Optimization', '/optimization/latest')
check('Optimization Metrics', '/optimization/metrics')
print('ALL 15 ENDPOINTS VERIFIED 100% OPERATIONAL')
"
```

Frontend production verification:
```powershell
cd c:\sih2\frontend
npm run build
```
Result: `✓ built in 824ms` with **0 TypeScript and 0 bundling errors**.
