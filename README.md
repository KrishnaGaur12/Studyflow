# StudyFlow

> A real-time collaborative study platform built for students who want to stay consistent, accountable, and focused — together.

---

## Problem Statement

Students preparing for exams or interviews often struggle to stay consistent while studying alone. Existing communication tools lack focused collaboration and accountability features designed specifically for group study sessions. StudyFlow solves this by providing a structured, distraction-free environment where students can study together in real time — no matter where they are.

---


🔗 [Live Demo](https://studyflow-two-phi.vercel.app/)

---

## Features

### Authentication
- Secure sign-in via **Google OAuth** and **email/password**
- Powered by Supabase Auth with automatic profile creation on first sign-in

### Study Room Management
- Create **open rooms** (visible to everyone) or **private invite-only rooms**
- Join private rooms via a unique invite code
- Room host controls who can start and stop sessions

### Synchronized Pomodoro Timer
- Shared **25-minute focus timer** controlled by the room host
- Timer state is synchronized across **all participants in real time** using Supabase Realtime
- Every member sees the same timer — no drift, no mismatch

### Live Presence & Status Tracking
- See **who is currently in the room** and their live status (Active / Idle)
- Presence updates instantly as members join or leave

### Real-time Room Chat
- Send and receive messages instantly inside any study room
- Chat persists so latecomers can see the conversation history

### Session History & Analytics
- Personal dashboard showing:
  - Total study time (hours + minutes)
  - Number of completed sessions
  - Total messages sent
  - Number of rooms joined
- Data visualized with clean, minimal stat cards

### Customizable User Profiles
- Upload a profile picture
- Set a display name, username, and a personal quote
- Profile updates reflect everywhere in real time

### Premium UI/UX
- Glassmorphic dark design with **Vanta.js FOG** animated 3D background (Three.js)
- Buttery smooth scrolling via **React Lenis**
- Fully responsive web application.
---


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Routing | Wouter |
| Styling | Vanilla CSS — CSS Variables, Flexbox, Grid |
| Icons | Lucide React |
| Smooth Scrolling | React Lenis |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google OAuth + Email) |
| Real-time | Supabase Realtime Channels (Presence + DB Webhooks) |
| Background Effects | Vanta.js (FOG) + Three.js |
| Deployment | Vercel |

---
## Project Structure

StudysFlows/
├── public/
│   ├── pfp1.png
│   └── pfp2.png
├── src/
│   ├── components/
│   │   ├── Background3D.tsx
│   │   ├── Chat.tsx
│   │   ├── CreateRoomModal.tsx
│   │   ├── Logo.tsx
│   │   ├── PresenceSidebar.tsx
│   │   ├── RoomCard.tsx
│   │   ├── RouteGuard.tsx
│   │   ├── Timer.tsx
│   │   └── TopNav.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Join.tsx
│   │   ├── Landing.tsx
│   │   ├── Lobby.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── Room.tsx
│   │   └── Signup.tsx
│   ├── styles/
│   │   └── tokens.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── supabase-schema.sql
├── tsconfig.json
├── vercel.json
└── vite.config.ts

## Setup

1. Clone the repo and run `npm install`
2. Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. Run `supabase-schema.sql` in your Supabase SQL Editor
4. Place `pfp1.png` and `pfp2.png` in the `public/` folder
5. Run `npm run dev`

## User Stories Covered

| Story | Status |
|---|---|
| Create study rooms | ✅ |
| Invite other users | ✅ |
| Start study sessions | ✅ |
| Track session durations | ✅ |
| Communicate within the room | ✅ |
| View room activity history | ✅ |