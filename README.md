# StudyFlow

StudyFlow is a real-time collaborative study platform that provides users with shared focus timers and accountability tools. It enables users to create or join study rooms, track their focus sessions, and communicate with others in real time.

## Features Implemented

*   **Real-time Study Rooms**: Create open or invite-only rooms for collaborative focus sessions.
*   **Synchronized Pomodoro Timers**: Shared 25-minute focus timers controlled by room hosts, perfectly synchronized across all participants.
*   **Live Presence & Status Tracking**: See who is currently in the room, along with their active status (Studying, On Break, Idle).
*   **Real-time Chat**: Instant messaging within study rooms to communicate without breaking focus.
*   **Session History & Analytics**: Dashboard tracking total study time, number of sessions, and historical activity data.
*   **Authentication**: Secure email/password and Google OAuth authentication using Supabase.
*   **Premium UI/UX**: "Glassmorphism" interface built on top of interactive 3D Vanta background effects, featuring a fully responsive layout.

## Tech Stack Used

*   **Frontend Framework**: React 18
*   **Build Tool**: Vite
*   **Routing**: Wouter
*   **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid) with custom frosted glass UI design
*   **Icons**: Lucide React
*   **Backend & Database**: Supabase (PostgreSQL)
*   **Real-time Capabilities**: Supabase Realtime Channels (Presence & Database WebSockets)
*   **Background Effects**: Vanta.js (FOG) with Three.js

## Project Setup Instructions

### Prerequisites

*   Node.js (v16 or higher)
*   npm or yarn
*   A Supabase project

### 1. Clone the repository

```bash
git clone <repository-url>
cd StudysFlows
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Execute the SQL commands found in `supabase-schema.sql` in your Supabase SQL Editor to provision the required tables, row-level security (RLS) policies, and database functions.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 6. Build for Production

```bash
npm run build
```

The compiled assets will be output to the `dist` directory.
