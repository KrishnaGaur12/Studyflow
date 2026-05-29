import { Switch, Route, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Lobby from '@/pages/Lobby';
import Room from '@/pages/Room';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Join from '@/pages/Join';
import Landing from '@/pages/Landing';

import { ReactLenis } from '@studio-freight/react-lenis';
import { Background3D } from '@/components/Background3D';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/join/:code" component={Join} />
      <Route path="/rooms/:id" component={Room} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/lobby" component={Lobby} />
      <Route path="/" component={Landing} />
      <Route component={Landing} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const show3D = location !== '/';
  
  return (
    <>
      {show3D && <Background3D />}
      <Router />
    </>
  );
}

export default function App() {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1, // Smooth factor
        duration: 1.2, // Animation duration
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false, // Keep mobile touch normal
        touchMultiplier: 2,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReactLenis>
  );
}
