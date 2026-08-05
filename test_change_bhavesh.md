# Test Change Log — Bhavesh

> Ye file har change ka record rakhti hai Hinglish mein.  
> Har entry mein likha hoga: **Kya change kiya**, **Kyu kiya**, aur **Kya impact aaya**.  
> ⚠️ Is file ko overwrite mat karna — sirf neeche append karna hai.

---

## 🔄 Change #1 — Initial Server Health Check
**Date:** 2026-08-04  
**Branch:** `develop`

### Kya kiya:
- `main` branch ka saara code `develop` branch mein merge kiya (fast-forward merge).
- Frontend build run kiya (`tsc -b && vite build`) — **successfully compiled**, koi error nahi aaya.
- Backend import check kiya (`from app.main import app`) — `python-multipart` dependency missing thi, wo install ki.
- Backend re-check kiya — **successfully imported**, koi runtime error nahi.

### Kyu kiya:
- Ye ensure karne ke liye ki `develop` branch pe current codebase bilkul stable hai aur koi compile-time ya runtime error nahi hai, taaki hum safely naye changes shuru kar sakein.

### Kya impact aaya:
- `develop` branch ab `main` ke saath fully in sync hai.
- `python-multipart` dependency install hui jo backend ke file upload endpoints (avatar upload) ke liye zaroori thi.
- Frontend aur Backend dono error-free state mein hain.
- Pydantic ke kuch deprecation warnings hain (`orm_mode` → `from_attributes`), lekin ye non-breaking hain. Future mein fix karna better hoga.

---

## 🔄 Change #2 — CORS Error Fix + Local Dummy Database Seeding
**Date:** 2026-08-04  
**Branch:** `develop`

### Kya kiya:
- **Root Cause Identify kiya:** CORS error actually CORS config ki wajah se nahi thi — backend mein `http://localhost:5173` origin pehle se set thi. Asli problem ye thi ki SQLite database mein tables hi exist nahi karte the (`no such table: hackathon`). Backend 500 error de raha tha, aur 500 error pe CORS headers response mein nahi jaate, isliye browser CORS error dikhata tha.
- **Naya file create kiya:** `backend/seed_local.py` — ek local-only seed script jo:
  - Safety check karta hai ki sirf SQLite (local) pe chale, production pe nahi.
  - `Base.metadata.create_all()` se saari tables create karta hai.
  - Realistic dummy data seed karta hai.
- **Purana `test.db` delete kiya** aur fresh seed run kiya.

### Dummy Data Details:
| Entity | Count | Details |
|---|---|---|
| Users | 16 | 1 admin, 2 coordinators, 3 judges, 10 students |
| Hackathons | 4 | 1 upcoming, 1 future, 1 ended, 1 active |
| Problem Statements | 9 | Different categories & difficulties |
| Teams | 6 | With proper members assigned |
| Team Members | 16 | Leaders & members properly linked |
| Registrations | 6 | Teams registered to hackathons |
| Submissions | 3 | For ended & active hackathons |
| Judge Assignments | 5 | Judges assigned to submissions |
| Evaluations | 4 | Scored evaluations for ended hackathon |
| Announcements | 4 | Different types (info, warning, success, urgent) |
| Notifications | 4 | For various student activities |

- **Sab users ka password:** `password123`
- **Login emails:** `admin@chms.local`, `bhavesh@chms.local`, `coordinator1@chms.local`, etc.

### Kyu kiya:
- Frontend se backend call hone pe `hackathon` table nahi mil rahi thi, toh 500 error aata tha. 500 error pe CORS headers nahi jaate, isliye browser "CORS blocked" dikhata tha.
- User ne bola tha ki dummy data locally chahiye jo server pe nahi jaaye — isliye SQLite database mein seed kiya aur script mein safety check daala ki production pe accidentally na chale.

### Kya impact aaya:
- ✅ CORS error completely resolved — API endpoints ab properly respond karte hain.
- ✅ Frontend ab hackathons, leaderboard, aur saara data load kar sakta hai.
- ✅ Saare roles (admin, coordinator, judge, student) ke liye login test kiya jaa sakta hai.
- ✅ `seed_local.py` reusable hai — agar database fresh chahiye toh `test.db` delete karke dubara run kar sakte ho.
- ⚠️ Ye dummy data sirf local SQLite mein hai, production (Supabase/PostgreSQL) pe nahi jaayega.

---

## 🔄 Change #3 — Avatar System Redesign
**Date:** 2026-08-05  
**Branch:** `main`

### Kya kiya:
- **Avatars Cropping:** `avatar_imgs` folder me jo 3 source images thi, unko Python script se crop karke 27 individual avatars banaye aur `frontend/public/avatars` me save kiye (`avatar_01.png` to `avatar_27.png`). Purane 10 avatars delete kar diye.
- **Central Config:** `frontend/src/config/avatars.ts` banaya jisme saare 27 avatars ke URLs ek jagah define kiye gaye.
- **Avatar Picker Modal:** Ek naya reusable component `AvatarPickerModal.tsx` banaya jo saare 27 avatars ko grid view me show karta hai.
- **Signup Page Redesign:** Puraana inline avatar picker hata diya. Ab user ka selected avatar box me show hota hai, aur uspe edit icon pe click karne se naya modal open hota hai.
- **AuthModal Redesign:** Same Signup page jaisa UI changes yaha bhi kiye.
- **Profile Page Redesign:** Profile picture pe 'Edit' icon lagaya jisse modal open hota hai. Edit mode se manual "Avatar URL" ka text field hata diya.

### Kyu kiya:
- Naye unique avatars use karne the jo user ne provide kiye the.
- Avatar selection ka UX improve karna tha taaki screen pe space bache (inline ki jagah modal) aur UI clean lage.
- Profile settings se Avatar URL text input hatana tha kyuki direct images select karna jyada intuitive hai.

### Kya impact aaya:
- ✅ UI bahot clean ho gaya hai Signup aur Profile pages me.
- ✅ Users ke paas ab 27 avatars ka naya aur better collection hai.
- ✅ Ek central modal component banne se code duplicacy kam ho gayi.

---

## 🔄 Change #4 — Larger Avatar Box & Student Social Links (GitHub & LinkedIn)
**Date:** 2026-08-05  
**Branch:** `main`

### Kya kiya:
- **Enlarged Avatar Box:** Signup page mein avatar box ka size `w-24 h-24` (96px) se bada karke `w-36 h-36` (144px) kiya. AuthModal mein `w-20 h-20` (80px) se bada karke `w-32 h-32` (128px) kiya. Edit button icons bhi proportionate scale up kiye.
- **Backend Schema & DB Model Update:** `User` model (`backend/app/models/user.py`) aur Pydantic schemas (`backend/app/schemas/user.py`) mein `github_url` aur `linkedin_url` columns/fields add kiye. Service layer me profile update logic update ki. `seed_local.py` me seed users ke sample links add kiye.
- **Frontend Student Profile Updates:**
  - `ProfilePage.tsx`: Edit profile section me GitHub URL aur LinkedIn URL ke input fields add kiye. Profile header banner aur account metadata list me live clickable GitHub / LinkedIn badges render kiye.
  - `StudentProfileModal.tsx`: Jab koi aur student/judge profile view karega toh profile modal me bhi GitHub aur LinkedIn links display honge.

### Kyu kiya:
- Avatar image choti lag rahi thi registration form pe — size badhane se selected avatar HD look ke saath clearly highlighted rehta hai.
- Student profile completeness ke liye GitHub aur LinkedIn handles mandatory hote hain hackathons me for portfolio review.

### Kya impact aaya:
- ✅ Form pe avatar preview clearly visible aur prominent ho gaya hai.
- ✅ Students ab apna GitHub aur LinkedIn portfolio link save aur display kar sakte hain.
- ✅ Build tests (`npm run build`) 100% pass!

---

## 🔄 Change #5 — Render DB Auto-Migration & Dynamic CORS Regex Fix
**Date:** 2026-08-05  
**Branch:** `main`

### Kya kiya:
- **Root Cause Identify kiya:** Production (Render PostgreSQL) pe database in 500 Internal Server Error de raha tha login endpoint (`POST /api/v1/auth/login`) call hone par. Kyunki humne pehle `github_url` aur `linkedin_url` naye columns model me add kiye the jo PostgreSQL database table (`user`) me physically exist nahi karte the. Server Exception throw kar raha tha aur 500 error ke response pe browser "CORS Policy Blocked" ka error surface kar raha tha.
- **Auto-Migration Script in Lifespan:** `backend/app/main.py` me `lifespan` startup hook me `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS ...` SQL queries add kiye jo `github_url`, `linkedin_url`, `auto_accept_invites`, `phone`, `semester` columns ko PostgreSQL pe automatically create kar dega render restart hone par.
- **Dynamic CORS Regex:** `CORSMiddleware` me `allow_origin_regex=r"https://.*\.vercel\.app"` add kiya taaki Vercel ka koi bhi preview deployment ya domain CORS block na ho.

### Kyu kiya:
- Live Vercel app (`https://chms-lj.vercel.app`) se Render backend (`https://chms-l2ya.onrender.com`) me login karte time HTTP 500 DB Exception + CORS error ho raha tha.

### Kya impact aaya:
- ✅ Database columns auto-create ho jayenge Render startup pe.
- ✅ HTTP 500 error resolve ho jayega aur login successful kaam karega.
- ✅ Vercel domains ke liye CORS issues permanently resolved.
