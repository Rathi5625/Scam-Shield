import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { ScanPage } from './pages/ScanPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';

// Lazy-loaded secondary application routes for bundle optimization
const ScreenshotScannerPage = lazy(() =>
  import('./pages/ScreenshotScannerPage').then((m) => ({ default: m.ScreenshotScannerPage }))
);
const LinkShieldPage = lazy(() =>
  import('./pages/LinkShieldPage').then((m) => ({ default: m.LinkShieldPage }))
);
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage }))
);
const HistoricalReportPage = lazy(() =>
  import('./pages/HistoricalReportPage').then((m) => ({ default: m.HistoricalReportPage }))
);
const FamilyProtectionPage = lazy(() =>
  import('./pages/FamilyProtectionPage').then((m) => ({ default: m.FamilyProtectionPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const RouteLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-mono">
    <div className="relative flex h-10 w-10 items-center justify-center">
      <div className="absolute h-full w-full rounded-full bg-primary/20 animate-ping" />
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
    <div className="text-xs text-muted-foreground tracking-widest uppercase">
      INITIALIZING SECURE MODULE...
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />

              {/* Onboarding Route (Authenticated, allowed incomplete status) */}
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute allowIncompleteOnboarding>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Operative Application Routes */}
              <Route
                path="scan"
                element={
                  <ProtectedRoute>
                    <ScanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="scanner"
                element={
                  <ProtectedRoute>
                    <ScanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="scanner/screenshot"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <ScreenshotScannerPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="scanner/link"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LinkShieldPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="scan/screenshot" element={<Navigate to="/scanner/screenshot" replace />} />
              <Route path="scan/link" element={<Navigate to="/scanner/link" replace />} />
              <Route path="result" element={<Navigate to="/scan" replace />} />

              <Route
                path="history"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <HistoryPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="history/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <HistoricalReportPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="family-protection"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <FamilyProtectionPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="family" element={<Navigate to="/family-protection" replace />} />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <SettingsPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
