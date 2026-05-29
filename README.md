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
- personalized rooms (private/personal) and global open rooms — create, join, or invite via code; host controls session start/stop

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

 - Frontend: React 18, Vite, Wouter, TypeScript
 - Styling & UX: CSS variables, Flexbox, Grid, Lucide React (icons), React Lenis, Three.js + Vanta.js
 - Backend & Realtime: Supabase (Postgres, Auth, Realtime, Storage)
 - Deployment & tooling: Vercel, npm

 Full tech list (concise)
 - React 18, TypeScript, Vite, Wouter
 - Supabase (Postgres, Auth, Realtime, Storage)
 - Three.js, Vanta.js (FOG), React Lenis
 - CSS variables, Flexbox, Grid, Lucide React
 - Vercel, npm

 Project (essential)
 - public/                — static assets (pfp images, etc.)
 - src/components/        — UI components
 - src/pages/             — route pages (Room, Lobby, Dashboard...)
 - src/context/           — React contexts (Auth, Theme, Toast)
 - src/lib/supabase.ts    — Supabase client
 - src/styles/            — design tokens and global CSS
 - package.json, vite.config.ts, tsconfig.json, README.md

 Quick setup
 ```bash
 npm install
 cp .env.example .env
 # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 # run the SQL schema in Supabase
 npm run dev
 ```

 User stories (implemented)
 - Create/join rooms ✅
 - Invite users ✅
 - Start shared sessions ✅
 - Track session time ✅
 - Real-time chat & presence ✅

 ---