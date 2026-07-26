# College Hackathon Management System (CHMS)

CHMS is a centralized, reusable, and scalable web platform designed to manage recurring internal college hackathons. The system replaces manual processes like Google Forms, WhatsApp, Excel sheets, and email coordination.

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v3.4 + Custom Glassmorphism Theme (Tech-Noir visual style)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Hosting**: Vercel (target)

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database ORM**: SQLAlchemy 2.0
- **Migration Tool**: Alembic 1.18
- **Authentication**: Supabase Auth (JWT validation template)
- **Hosting**: Railway (preferred target)
- **Database**: Supabase PostgreSQL

---

## Folder Structure

The project foundation is divided into separate frontend and backend directories:

```
chms/
├── README.md
├── TASKS.md
├── CHANGELOG.md
├── frontend/
│   ├── .env.example            # Frontend environment variable template
│   ├── tsconfig.app.json       # TS configuration with @/* path aliases
│   ├── vite.config.ts          # Vite config with alias resolving
│   ├── tailwind.config.js      # Custom Tech-Noir colors, borders, fonts
│   ├── src/
│   │   ├── main.tsx            # React application entry point
│   │   ├── App.tsx             # Main routing configuration
│   │   ├── index.css           # Global custom scrollbars, animations, layers
│   │   ├── components/ui/      # Reusable UI component library
│   │   │   ├── button.tsx      # Rounded pill primary/secondary buttons
│   │   │   ├── input.tsx       # Glass-style text inputs with validation border states
│   │   │   ├── card.tsx        # Glassmorphic containers (32px/40px radius)
│   │   │   ├── modal.tsx       # Overlay modal dialogs with backdrop blur
│   │   │   ├── table.tsx       # Dark theme responsive tables
│   │   │   ├── badge.tsx       # Low-opacity status labels (success, danger, warning)
│   │   │   └── loader.tsx      # Spinner indicators with neon cyan glow
│   │   ├── layouts/            # Reusable page wrappers
│   │   │   ├── BaseLayout.tsx  # General background setup
│   │   │   └── AppLayout.tsx   # Persistent sidebar navigation & topbar layouts
│   │   ├── constants/          # Application-wide roles and statuses enums
│   │   ├── types/              # Unified TypeScript definitions
│   │   └── services/           # API integrations (empty placeholder)
└── backend/
    ├── requirements.txt        # Backend dependencies
    ├── alembic.ini             # Alembic migration configuration
    ├── .env.example            # Backend environment variable template
    ├── app/
    │   ├── main.py             # FastAPI bootstrap, CORS, exception middleware registration
    │   ├── config.py           # Pydantic Settings configuration manager
    │   ├── database.py         # SQLAlchemy engine and session pool setups
    │   ├── api/
    │   │   ├── deps.py         # Scoped db yielding & Supabase token auth stub
    │   │   └── v1/
    │   │       └── router.py   # API endpoints routing table
    │   ├── models/
    │   │   └── base.py         # Declarative BaseTable with common fields
    │   ├── middleware/
    │   │   └── exception_handler.py # Global structured JSON error responses
    │   ├── schemas/            # Pydantic response/request validation schemas
    │   └── services/           # Database operations service layers
    └── migrations/
        └── env.py              # Dynamic Alembic db url loader config
```

---

## Architecture Decisions

1. **Monorepo Split Layout**: Separating the React `frontend` and FastAPI `backend` simplifies independent testing, builds, deployment pipelines (Vercel and Railway), and aligns with team member feature allocations.
2. **Unified JSON API Interface**: Standardized response templates enforced by backend middleware ensure consistent client-side response handling:
   ```json
   {
     "success": true,
     "message": "Operation completed successfully.",
     "data": {}
   }
   ```
3. **Decoupled Configuration**: Database connection urls are loaded dynamically from environment files into Alembic migrations (`migrations/env.py`) and SQLAlchemy scopes (`app/database.py`), preventing hardcoded credentials.
4. **Strict TypeScript & Path Resolution**: Paths are resolved using `@/*` mapping directly to `src/*`, keeping imports clean. Deprecations are handled via `"ignoreDeprecations": "6.0"` to match compiler guidelines.

---

## Running the Project Locally

### Prerequisites
- Node.js 18+
- Python 3.10+

### Start Frontend
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`
3. Launch development server: `npm run dev` (runs on `http://localhost:5173`)

### Start Backend
1. Navigate to `backend/`.
2. Initialize virtual environment: `python -m venv .venv`
3. Activate virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Mac/Linux: `source .venv/bin/activate`
4. Install packages: `pip install -r requirements.txt`
5. Launch FastAPI server: `uvicorn app.main:app --reload` (runs on `http://127.0.0.1:8000`)
