# Changelog

All notable changes to the College Hackathon Management System (CHMS) project will be documented in this file.

## [1.0.0-alpha] - 2026-07-25
### Added
- **Frontend Foundation**:
  - React 19 + TypeScript + Vite 8 scaffold.
  - Tailwind CSS v3.4 integration + custom Tech-Noir palette and custom classes (`glass-card`, `glass-surface`, `text-glow-cyan`, `text-glow-magenta`, `border-glow-cyan`).
  - Google Fonts setup (Archivo and Manrope).
  - Reusable UI core component library:
    - [button.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/button.tsx): Pill shapes with neon focus overlays.
    - [input.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/input.tsx): Minimal input fields with validation states.
    - [card.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/card.tsx): Blurry glass cards with customizable border radii.
    - [modal.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/modal.tsx): Centered dialog modals with backdrop blur.
    - [table.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/table.tsx): Dark theme responsive tables.
    - [badge.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/badge.tsx): Compact colored status indicators.
    - [loader.tsx](file:///d:/study/sdp/chms/frontend/src/components/ui/loader.tsx): Glowing neon circular loaders.
  - Reusable base layouts:
    - [BaseLayout.tsx](file:///d:/study/sdp/chms/frontend/src/layouts/BaseLayout.tsx): Global HTML styling setups.
    - [AppLayout.tsx](file:///d:/study/sdp/chms/frontend/src/layouts/AppLayout.tsx): Sidebar navigation panel, system status headers, responsive layout gaps.
  - Application configuration constants and TypeScript interfaces mapping roles and states.
  - Development build test verification (succeeded).
- **Backend Foundation**:
  - FastAPI bootstrap with CORS settings.
  - Pydantic Settings integration for environment variables.
  - SQLAlchemy setup and scoped session injection hooks.
  - Declarative Base class registry base model.
  - Alembic migrations init and custom dyn-URL resolution configuration.
  - Standard JSON envelope exception handlers mapping HTTP, validation, and database errors.
  - REST routers skeleton (`/auth`, `/users`, `/hackathons`, `/teams`).
  - Uvicorn host server verification (succeeded).
