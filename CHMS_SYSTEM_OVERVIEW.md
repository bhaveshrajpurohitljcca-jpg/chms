# 🚀 College Hackathon Management System (CHMS) — Complete System Architecture & Overview

This document provides a comprehensive technical overview of the **CHMS** platform. It is designed to give any AI assistant or developer an instant, deep understanding of the entire codebase, technology stack, data models, authentication mechanisms, design system, and key workflows.

---

## 🛠️ 1. Technology Stack

### **Frontend**
- **Framework & Core**: React 18, TypeScript, Vite.
- **Styling & UI**: Tailwind CSS (with `darkMode: 'class'`), Vanilla CSS Variables (`index.css`), Lucide Icons.
- **3D Graphics & Animations**: Three.js (`ThreeParticleBg.tsx` for dynamic hero particle effects).
- **State & Context**: React Context API (`AuthContext`, `ThemeContext`).
- **Routing**: React Router DOM (`/student/*`, `/coordinator/*`, `/judge/*`, `/admin/*`).

### **Backend**
- **Framework**: Python 3.10+, FastAPI (Asynchronous REST API).
- **ORM & Database**: SQLAlchemy 2.0, Pydantic v2 (Schemas), SQLite (Local Dev) / PostgreSQL / Supabase (Production).
- **Authentication**: JWT Tokens (Jose/Passlib), Role-Based Access Control (RBAC).
- **Email Engine**: Python `smtplib` + MIME via Gmail SMTP (HTML Email Templates).

---

## 📁 2. Repository Structure

```
chms/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # REST Endpoints (auth, hackathons, teams, announcements, etc.)
│   │   ├── models/             # SQLAlchemy ORM Database Models
│   │   ├── schemas/            # Pydantic Request & Response Schemas
│   │   ├── utils/              # Helper utilities (email.py for SMTP dispatching)
│   │   ├── config.py           # Application Settings & Env Loader
│   │   ├── database.py         # DB Engine & Session SessionLocal
│   │   └── main.py             # FastAPI App Entrypoint & Middleware
│   ├── .env                    # Local Environment Configuration (SMTP, DB, JWT)
│   └── .env.example            # Environment template for deployment
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI & Layout Components (loader, card, badge)
│   │   ├── context/            # AuthContext.tsx, ThemeContext.tsx
│   │   ├── layouts/            # RoleLayout.tsx (Role protection & responsive sidebar)
│   │   ├── pages/              # Role-specific Pages (Student, Coordinator, Judge, Admin)
│   │   ├── App.tsx             # Main Router & Landing Page Component
│   │   ├── index.css           # Design System Tokens (Light Mode White+Navy / Dark Mode Noir)
│   │   └── main.tsx            # React Root Entrypoint
│   ├── tailwind.config.js      # Tailwind Config (darkMode: 'class')
│   └── vite.config.ts          # Vite Config
```

---

## 🎨 3. Design System & Dual-Theme Architecture

CHMS features a fully synced **Dual Theme** system controlled by `ThemeContext.tsx` and toggled via `document.documentElement` (`<html class="light">` vs `<html class="dark">`).

| Theme Element | Dark Mode (Tech-Noir) | Light Mode (Academic Navy) |
|---|---|---|
| **Background** | `#050505` (Deep Void Black) | `#ffffff` (Pure Crisp White) |
| **Primary Accent** | `#00f3ff` (Cyan) | `#1a3c8f` (Deep Navy Blue) |
| **Secondary Accent** | `#ff00c1` (Magenta) | `#2563eb` (Royal Blue) |
| **Heading Text** | `#ffffff` (Pure White) | `#0f1c3f` (Dark Slate Navy) |
| **Body Text** | `rgba(255,255,255,0.65)` | `#3d5080` (Mid Navy Grey) |
| **Borders** | `rgba(255,255,255,0.10)` | `rgba(26, 60, 143, 0.18)` |
| **Glow Effects** | Cyan & Pink Neon Shadows | Clean Flat Soft Shadows |

---

## 🔐 4. User Roles & Access Control (RBAC)

The system supports four distinct user roles:

1. **`STUDENT`**:
   - Browse hackathons, register teams, join teams via invite code or email invitation.
   - Submit project code, links, and documents.
2. **`COORDINATOR`**:
   - Create and manage college hackathons, problem statements, and schedules.
   - Send announcements (Global, Team, or Personal) with email alerts.
3. **`JUDGE`**:
   - Review project submissions, score teams on predefined rubrics, and leave feedback.
4. **`ADMIN`**:
   - Full system administration, user management, platform-wide metrics, and global overrides.

---

## 💾 5. Core Data Models (SQLAlchemy)

- **`User`**: `id`, `full_name`, `email`, `role`, `hashed_password`, `ps_number`, `college`, `avatar_url`.
- **`Hackathon`**: `id`, `title`, `description`, `status` (`DRAFT`, `UPCOMING`, `ACTIVE`, `ENDED`), `start_date`, `end_date`, `max_team_size`.
- **`Team`**: `id`, `name`, `hackathon_id`, `leader_id`, `join_code`, `status`.
- **`Registration`**: `id`, `user_id`, `hackathon_id`, `team_id`, `registered_at`.
- **`Submission`**: `id`, `team_id`, `hackathon_id`, `repo_url`, `demo_url`, `score`, `status`.
- **`Invitation`**: `id`, `team_id`, `invitee_id`, `inviter_id`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`).
- **`Notification`**: `id`, `user_id`, `title`, `message`, `type`, `read`.
- **`Announcement`**: `id`, `title`, `content`, `announcement_type`, `target_role`, `target_team_id`, `creator_id`.

---

## 📧 6. Email Notification Engine (Gmail SMTP)

Email notifications are dispatched via `backend/app/utils/email.py` using Python `smtplib` and MIME multipart HTML templates.

### **Configured Triggers:**
1. **Team Invitation Emails**: Sent automatically when a team leader invites a student to join a team for a hackathon.
2. **Announcement Emails**: Dispatched when an Admin or Coordinator posts an announcement (Personal, Team, or Global).

### **Environment Setup (`backend/.env`):**
```env
SMTP_FROM_EMAIL="your-gmail@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
```

---

## 🚀 7. How to Run Locally

### **Backend:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### **Frontend:**
```bash
cd frontend
npm install
npm run dev
```
- Access Frontend: `http://localhost:5173/`
- Access Backend API Docs: `http://localhost:8000/docs`
