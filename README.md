# StudyFlow

StudyFlow is a premium, real-time collaborative study platform that provides users with shared focus timers and accountability tools. It enables users to create or join study rooms, track their focus sessions, communicate with others in real time, and customize their study profiles.

## Features Implemented

*   **Premium Glassmorphic UI**: High-end interface built on top of interactive 3D Vanta background effects (`Vanta.FOG` & Three.js).
*   **Lenis Smooth Scrolling**: Buttery smooth, native-feeling scrolling experience across the entire application using `@studio-freight/react-lenis`.
*   **Real-time Study Rooms**: Create open global rooms or private invite-only rooms for collaborative focus sessions.
*   **Synchronized Pomodoro Timers**: Shared 25-minute focus timers controlled by room hosts, perfectly synchronized across all participants using Supabase Realtime.
*   **Live Presence & Status Tracking**: See exactly who is currently in the room, along with their active status (Live, Idle, etc.).
*   **Real-time Chat**: Instant messaging within study rooms to communicate without breaking focus.
*   **Customizable User Profiles**: Upload custom profile pictures, update display names, usernames, and favorite quotes.
*   **Session History & Analytics**: Dashboard tracking total study time, number of sessions, messages sent, rooms joined, and historical activity data visualized with vibrant, minimal stat cards.
*   **Authentication**: Secure email/password and Google OAuth authentication using Supabase.

## Tech Stack Used

*   **Frontend Framework**: React 18
*   **Build Tool**: Vite
*   **Routing**: Wouter
*   **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid) with custom frosted glass UI design
*   **Icons**: Lucide React
*   **Smooth Scrolling**: React Lenis
*   **Backend & Database**: Supabase (PostgreSQL, Storage, Auth)
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

### 5. Storage Setup (For Avatars)

To enable profile picture uploads:
1. Go to your **Supabase Dashboard** -> **Storage**.
2. Create a new bucket named exactly: `avatars`.
3. Check the **Public bucket** option.
4. Go to **Storage -> Policies** and create a new policy under the `avatars` bucket.
5. Name it `Allow authenticated uploads`, allow **SELECT**, **INSERT**, and **UPDATE** operations, and target the `authenticated` role.

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 7. Build for Production

```bash
npm run build
```

The compiled assets will be output to the `dist` directory.
