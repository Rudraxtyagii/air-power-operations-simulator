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
2. **Operations Research Engine (Google OR-Tools CP-SAT)** for multi-objective constraint satisfaction (flight crew resting, fuel thresholds, maintenance turnaround, weather avoidance).
3. **Machine Learning Pipeline (Scikit-Learn)** for predictive asset availability and turnaround forecasting.
4. **Dynamic Re-planning Simulator** to handle real-time injects (asset failures, runway closures, priority overrides, weather disruptions) in sub-2-second response times.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────┐
                    │        React + Vite + TypeScript        │
                    │   Tactical Command-Center Interface    │
                    │ (Tailwind CSS, Lucide Icons, Recharts) │
                    └───────────────────┬────────────────────┘
                                        │ REST / WebSockets
                                        ▼
                    ┌────────────────────────────────────────┐
                    │            FastAPI Backend             │
                    │   - Mission Dispatcher & Validation    │
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
       │     Synthetic Air Data       │
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
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── __init__.py
│       ├── main.py             # FastAPI entrypoint
│       ├── core/
│       │   ├── __init__.py
│       │   └── config.py       # Pydantic settings
│       ├── models/             # Database ORM models
│       ├── schemas/            # Pydantic I/O models
│       │   ├── __init__.py
│       │   └── domain.py
│       └── api/
│           ├── __init__.py
│           └── endpoints.py    # Synthetic REST endpoints
└── frontend/                   # React + TypeScript + Vite UI
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx             # Main dashboard navigation shell
        ├── index.css           # Command center styling & animations
        ├── components/         # Reusable tactical UI components
        │   ├── Header.tsx      # Top status bar & live simulation clock
        │   ├── Sidebar.tsx     # Command center navigation
        │   ├── TacticalMap.tsx # Operations visualization canvas
        │   ├── StatCard.tsx    # Telemetry KPI cards
        │   └── Modal.tsx       # Action dialogs
        ├── pages/              # Module screens
        │   ├── Dashboard.tsx   # Integrated operations overview
        │   ├── Missions.tsx    # Mission management & scheduling
        │   ├── Resources.tsx   # Fleet & asset readiness telemetry
        │   ├── Optimization.tsx# CP-SAT solver control & schedule
        │   ├── Simulation.tsx  # Dynamic disruption inject & re-planner
        │   └── Analytics.tsx   # Performance comparison & KPIs
        └── types/              # TypeScript interface definitions
```

---

## 🚀 Quick Start Guide

### Option 1: Run Frontend Locally (Fastest)

**Prerequisites:** Node.js v18+ and npm installed.

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at: **`http://localhost:5173`**

### Option 2: Run Full Stack with Docker Compose

**Prerequisites:** Docker and Docker Compose installed.

```bash
# From project root:
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## 🎯 Command Center Features

1. **Dashboard Overview**:
   - Total Missions, Available Aircraft, Active Missions, Mission Completion %.
   - **Interactive Live Operations Map**: Synthetic radar zones (Zone A–D), aircraft telemetry beacons, status markers.
   - **Mission Status Donut Chart**: Completed, Ongoing, Pending, Delayed.
   - **Recent Alerts Telemetry**: Real-time event log with severity indicators.
   - **Direct Tactical Controls**: "Generate Optimal Plan" and "Simulate Disruption".

2. **Mission Management**:
   - Filterable mission ledger by Priority (High, Medium, Low) and Status.
   - Time window constraints and required asset payloads.
   - Add/inspect synthetic mission parameters.

3. **Resource Management**:
   - Aircraft fleet tracking (Type-A, Type-B, Type-C).
   - Real-time fuel telemetry gauge, maintenance status pills, predicted readiness %.
   - Synthetic staging locations (Base-1, Base-2, Base-3, Zone A).

4. **Optimization & Scheduling**:
   - Multi-objective selector (Minimize Delay, Maximize Resource Efficiency, Rapid Response).
   - Constraint toggles: Weather avoidance, predicted availability, maintenance buffers, dynamic re-planning.
   - Optimized mission timeline & assignment schedule.

5. **Simulation & Dynamic Re-planning**:
   - Interactive disruption triggers: Resource Unavailable, Capacity Reduced, Priority Shift, Weather Impact, Resource Delayed.
   - Live Before vs. After re-optimization delta metrics (Average delay, utilization, re-planning latency).
   - Automated 6-step re-planning action resolution pipeline.

6. **Analytics & Performance**:
   - 7-Day comparative evaluation (Baseline vs. AI-Optimized).
   - Mission completion rate trends, resource utilization bars, and average delay reduction metrics.

---

## 🛡️ Synthetic Data Compliance Notice

In full compliance with safety, ethics, and competitive integrity guidelines:
- All aircraft identifiers (`Type-A`, `A01-A08`), operational zones (`Zone A`, `Base-1`), and mission profiles (`Reconnaissance Alpha`) are **purely synthetic and abstract**.
- No classified or sensitive defense systems, tactical algorithms, or real geographical coordinates are included or referenced.
