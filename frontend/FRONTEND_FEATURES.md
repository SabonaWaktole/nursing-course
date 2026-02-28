# CNA Pro — Frontend Functionality Overview

**Framework:** Next.js (App Router) · **Port:** `http://localhost:3000`

---

## Table of Contents

1. [Landing Page](#1-landing-page)
2. [Authentication](#2-authentication)
3. [Course Catalog](#3-course-catalog)
4. [Course Detail](#4-course-detail)
5. [My Learning (Enrolled Courses)](#5-my-learning)
6. [Quiz System](#6-quiz-system)
7. [Certificates](#7-certificates)
8. [Certificate Verification](#8-certificate-verification)
9. [User Settings](#9-user-settings)
10. [Admin Dashboard](#10-admin-dashboard)
11. [Navigation & Layout](#11-navigation--layout)
12. [Role-Based Access](#12-role-based-access)

---

## 1. Landing Page

**Route:** `/`

| Feature | Description |
|---------|-------------|
| Hero Section | Title, tagline, and CTA buttons ("Get Started" → `/register`, "Browse Courses" → `/courses`) |
| Feature Cards | Three cards: Comprehensive Curriculum, Expert Instructors, Certification Ready |
| Featured Courses | Auto-fetches and displays up to 3 courses from the API with thumbnails, star ratings, instructor info, and pricing |
| Stats Bar | Visual counters for total courses, students, and certifications |
| Responsive | Fully responsive layout for mobile/desktop |

---

## 2. Authentication

### Login Page — `/login`

| Feature | Description |
|---------|-------------|
| Email/password form | Standard login with validation |
| Show/hide password | Toggle eye icon |
| Error display | Shows API error messages (e.g. "Invalid credentials") |
| Role-based redirect | Admins → `/admin`, Students → `/courses` |
| Link to register | "Don't have an account? Create one" |

### Register Page — `/register`

| Feature | Description |
|---------|-------------|
| Name, email, password form | With min 6-char password validation |
| Show/hide password | Toggle eye icon |
| Error display | Shows API errors (e.g. "User already exists") |
| Auto-login | Registers and logs in automatically, redirects to `/courses` |
| Link to login | "Already have an account? Sign in" |

### Auth Context (`auth-context.tsx`)

| Feature | Description |
|---------|-------------|
| JWT token storage | Stored in `localStorage`, auto-attached to API requests |
| User state | `user` object available globally (id, email, name, role) |
| `login()` / `register()` / `logout()` | Auth methods available via `useAuth()` hook |
| Auto-restore session | On page load, restores user from `localStorage` |

---

## 3. Course Catalog

**Route:** `/courses`

| Feature | Description |
|---------|-------------|
| Course grid | 3-column responsive grid of course cards |
| Search | Real-time text search by title and description |
| Tag filter | Toggle buttons (All, Nursing, CNAprep, Clinical, other, etc) to filter courses by tags |
| Course cards | Thumbnail (or gradient fallback), tag badges (blue), category badge (green), module count badge, star rating, instructor avatar, price |
| Click to detail | Each card links to `/courses/[id]` |
| Loading spinner | Shows while fetching courses |
| Empty state | "No courses found" with icon when no results match |

---

## 4. Course Detail

**Route:** `/courses/[id]`

| Feature | Description |
|---------|-------------|
| Course header | Title, description, instructor name, category badge |
| Enroll button | One-click enrollment (auth required). Shows "Already Enrolled" if already enrolled |
| Module accordion | Expandable/collapsible modules with chevron icons |
| Lesson list | Per module: title, description, video icon, material icon |
| Video player | Inline `<video>` player for lesson videos (auto-plays selected lesson) |
| Material download | Download link for lesson PDF/docs |
| Progress tracking | Auto-updates enrollment progress as lessons are viewed |
| Sequential navigation | "Next" button advances through lessons, then module quizzes, then final exams |
| Module quizzes | Start quiz buttons appear per module |
| Final exams | Listed separately with start buttons |
| Back navigation | Arrow back button to `/courses` |
| Certificate link | Shown when course is completed |

---

## 5. My Learning

**Route:** `/my-courses`

🔒 **Student only** (role-guarded)

| Feature | Description |
|---------|-------------|
| Enrolled courses grid | Cards showing all courses the student has enrolled in |
| Progress bar | Visual bar showing completion % per course |
| Completion badge | Green "Completed" badge when 100% |
| Lesson count | Shows total lessons per course |
| Empty state | "No courses yet" with "Browse Courses" CTA |
| Click to continue | Each card links to `/courses/[id]` to resume learning |

---

## 6. Quiz System

**Route:** `/quiz/[quizId]`

🔒 **Auth required** (role-guarded for students)

| Feature | Description |
|---------|-------------|
| Question display | One question at a time with numbered progress |
| Multiple choice | 4-option radio-style selection with click highlight |
| Timer | Countdown timer displayed during the quiz |
| Progress bar | Visual progress through questions |
| Submit | Manual submission with answer validation |
| Result screen | Shows score, pass/fail, correct count, passing threshold |
| Pass/Fail UI | Green celebration for pass, red for fail |
| Retry button | Re-attempt the quiz if failed |
| Next exam flow | If passed, prompts to proceed to the next final exam |
| Course completion | When all final exams passed: shows confetti-style celebration, links to certificate |
| Certificate auto-generation | If course completed, certificate is auto-created and linked |

---

## 7. Certificates

**Route:** `/certificates`

🔒 **Student only** (role-guarded)

| Feature | Description |
|---------|-------------|
| Certificate grid | Cards for each earned certificate |
| Certificate info | Course title, unique credential ID (monospace), issue date, verified status |
| View & Print | Links to `/certificate/verify/[uniqueId]` with full certificate display |
| Download PDF | Opens PDF download in new tab via backend URL |
| Empty state | "No certificates yet" with link to browse courses |
| Premium UI | Gradient accents, hover animations, icon transitions |

---

## 8. Certificate Verification

**Route:** `/certificate/verify/[uniqueId]`

🌐 **Public — no auth required**

| Feature | Description |
|---------|-------------|
| Certificate display | Full visual certificate matching the PDF design |
| Student name | Large cursive font (Great Vibes style) |
| Course title | Bold blue text |
| "Authenticated Record" badge | Visual badge confirming authenticity |
| Issue date | Formatted date display |
| Director signature | Cursive signature with title |
| Credential ID | Monospace footer with unique ID |
| Print button | Browser print for the certificate |
| Download PDF | Direct download link |
| Invalid state | Error screen if certificate ID doesn't exist |
| Validation details | Sidebar or section with validation number, issue date, verify URL |

---

## 9. User Settings

**Route:** `/settings`

🔒 **Auth required** (any logged-in user)

| Feature | Description |
|---------|-------------|
| Profile section | Update name and email with current values pre-filled |
| Password section | Change password with current + new password fields |
| Success/error alerts | Green success banners, red error banners |
| Form validation | Required fields, backend error display |
| Save buttons | Separate save for profile and password |

---

## 10. Admin Dashboard

**Route:** `/admin`

🔒 **Admin only** (role-guarded)

### Tabbed Interface

| Tab | Features |
|-----|----------|
| **Overview** | Stats cards (total users, courses, enrollments, certificates), recent enrollments table |
| **Courses** | Full course CRUD, module/lesson/quiz management |
| **Users** | User list with search, enrollment/certificate counts, delete users |
| **Results** | All quiz results across all users with scores and pass/fail |

### Course Management (Courses Tab)

| Feature | Description |
|---------|-------------|
| Create course | Title, description, category dropdown, price, tags (multi-select toggle), thumbnail upload |
| Edit course | Pre-fills form with existing data, same fields as create |
| Delete course | Confirmation dialog, cascading delete |
| Thumbnail upload | Image upload to Supabase, preview display in form |
| **Tags** | Multi-select toggle buttons: Nursing, CNAprep, Clinical, other, etc. Click to toggle on/off |
| Tag display | Blue pill badges shown on admin course cards |
| Expand course | Click a course to see its full module/lesson/quiz tree |

### Module Management (within expanded course)

| Feature | Description |
|---------|-------------|
| Add module | Prompt for title, auto-ordered |
| Delete module | Cascading delete with lessons |

### Lesson Management (within modules)

| Feature | Description |
|---------|-------------|
| Add lesson | Form with title, description |
| Video upload | File picker → upload to Supabase → URL saved |
| Material upload | File picker (PDF, DOC, ZIP, PPT, etc.) → upload to Supabase → URL saved |
| Delete lesson | Single click delete |
| Inline editing | Edit lesson title/description |

### Quiz Management (within course or module)

| Feature | Description |
|---------|-------------|
| Create quiz | Title, passing score, questions with options + correct answer |
| Module quiz | Attached to a specific module |
| Final exam | Course-level quiz (no moduleId) |
| Add questions | Dynamic question builder — text, 4 options, select correct answer |
| Edit quiz | Full question replacement (atomic update) |
| Delete quiz | Cascading delete with results |

### User Management (Users Tab)

| Feature | Description |
|---------|-------------|
| User list | Name, email, role, join date |
| Enrollment/cert counts | Per-user stats |
| Delete user | Cascading delete (results, enrollments, certificates, user) |
| Self-delete protection | Admin cannot delete their own account |

### Results Tab

| Feature | Description |
|---------|-------------|
| Results table | Student name, email, quiz title, course title, score, pass/fail, date |
| Color-coded | Green for pass, red for fail |

---

## 11. Navigation & Layout

### Navbar

| Feature | Description |
|---------|-------------|
| Logo/Home link | "CareAcademy" branding → `/` |
| Contact bar | Phone number + email + social links (Facebook, Instagram) |
| Nav links | Courses, My Learning, Certificates (student), Admin (admin) |
| Search | Search bar that redirects to `/courses?search=query` |
| User menu | Avatar with name, Settings link, Logout |
| Mobile menu | Hamburger toggle → full mobile nav drawer |
| Auth-aware | Shows Login/Register when logged out, user menu when logged in |
| Role-aware | Shows different links for STUDENT vs ADMIN |

### Footer

| Feature | Description |
|---------|-------------|
| Branding | CareAcademy description |
| Quick links | Courses, My Learning, Certificates |
| Contact info | Phone, email, social links |
| Copyright | Dynamic year |

---

## 12. Role-Based Access

The `RoleGuard` component wraps pages that require specific roles:

| Role | Accessible Pages |
|------|-----------------|
| **Public** (no login) | `/`, `/login`, `/register`, `/courses`, `/courses/[id]`, `/certificate/verify/[uniqueId]` |
| **STUDENT** | All public + `/my-courses`, `/quiz/[quizId]`, `/certificates`, `/settings` |
| **ADMIN** | All public + `/admin`, `/settings` |

Unauthorized users are redirected or shown an access-denied message.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React + Material Symbols |
| HTTP Client | Axios (custom `api` wrapper with JWT interceptor) |
| State | React Context (AuthContext) + `useState` |
| Auth | JWT Bearer tokens in `localStorage` |
| File Storage | Supabase Storage (via backend upload endpoints) |
