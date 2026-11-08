import * as React from "react";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { isTokenValid, msUntilExpiry } from "@/lib/token";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Lazy-loaded pages for code splitting & bundle size optimization
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Products = lazy(() => import("@/pages/Products"));
const Orders = lazy(() => import("@/pages/Orders"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Promotions = lazy(() => import("@/pages/Promotions"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Login"));
const Brands = lazy(() => import("@/pages/Brands"));
const Categories = lazy(() => import("@/pages/Categories"));
const Users = lazy(() => import("@/pages/Users"));
const RoleGrants = lazy(() => import("@/pages/RoleGrants"));
const Banners = lazy(() => import("@/pages/Banners"));
const Tags = lazy(() => import("@/pages/Tags"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const InventoryStorage = lazy(() => import("@/pages/inventory/InventoryStorage"));
const InventoryInputs = lazy(() => import("@/pages/inventory/InventoryInputs"));
const ReturnedOrders = lazy(() => import("@/pages/orders/ReturnedOrders"));
const OrdersAnalytics = lazy(() => import("@/pages/orders/OrdersAnalytics"));
const Notifications = lazy(() => import("@/pages/notifications/Notifications"));
const Messages = lazy(() => import("@/pages/notifications/Messages"));
const NotificationSettings = lazy(() => import("@/pages/notifications/NotificationSettings"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const SupplierDetails = lazy(() => import("@/pages/SupplierDetails"));
const FinanceOverview = lazy(() => import("@/pages/finance/FinanceOverview"));
const FinanceTransactions = lazy(() => import("@/pages/finance/FinanceTransactions"));
const FinanceBills = lazy(() => import("@/pages/finance/FinanceBills"));
const FinancePayroll = lazy(() => import("@/pages/finance/FinancePayroll"));
const FinanceBranches = lazy(() => import("@/pages/finance/FinanceBranches"));
const FinanceReports = lazy(() => import("@/pages/finance/FinanceReports"));
const FinanceApprovals = lazy(() => import("@/pages/finance/FinanceApprovals"));

// Elegant loading fallback
function PageLoadingFallback() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3" dir="rtl">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground animate-pulse">در حال بارگذاری صفحه...</span>
    </div>
  );
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route — validates token on every navigation and on a timer
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth, logout } = useAuthStore();
  const location = useLocation();

  // Re-check on every route change
  const valid = isTokenValid();

  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  // Schedule auto-logout exactly when token expires
  useEffect(() => {
    if (!valid) return;
    const ms = msUntilExpiry();
    if (ms <= 0) return;
    const timer = window.setTimeout(() => {
      logout({ expired: true });
      window.location.href = '/login?expired=1';
    }, ms);
    const interval = window.setInterval(() => {
      if (!isTokenValid()) {
        logout({ expired: true });
        window.location.href = '/login?expired=1';
      }
    }, 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [valid, logout]);

  if (!valid && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!valid) {
    return <Navigate to="/login?expired=1" replace />;
  }

  return <>{children}</>;
}


const App = () => {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/categories" element={
                  <ProtectedRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/brands" element={
                  <ProtectedRoute>
                    <Layout>
                      <Brands />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/products" element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Layout>
                      <Orders />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/orders/returned" element={
                  <ProtectedRoute>
                    <Layout>
                      <ReturnedOrders />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/orders/analytics" element={
                  <ProtectedRoute>
                    <Layout>
                      <OrdersAnalytics />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Redirect /customers to /users */}
                <Route path="/customers" element={<Navigate to="/users" replace />} />

                <Route path="/users" element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/role-grants" element={
                  <ProtectedRoute>
                    <Layout>
                      <RoleGrants />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/promotions" element={
                  <ProtectedRoute>
                    <Layout>
                      <Promotions />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/banners" element={
                  <ProtectedRoute>
                    <Layout>
                      <Banners />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/tags" element={
                  <ProtectedRoute>
                    <Layout>
                      <Tags />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Inventory Routes */}
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Layout>
                      <Inventory />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/inventory/storage" element={
                  <ProtectedRoute>
                    <Layout>
                      <InventoryStorage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/inventory/locations" element={
                  <ProtectedRoute>
                    <Layout>
                      <InventoryStorage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/inventory/inputs" element={
                  <ProtectedRoute>
                    <Layout>
                      <InventoryInputs />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Notifications & Messages Routes */}
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/notification-settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <NotificationSettings />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Suppliers Routes */}
                <Route path="/suppliers" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suppliers />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/suppliers/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <SupplierDetails />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Finance Routes */}
                <Route path="/finance" element={<ProtectedRoute><Layout><FinanceOverview /></Layout></ProtectedRoute>} />
                <Route path="/finance/transactions" element={<ProtectedRoute><Layout><FinanceTransactions /></Layout></ProtectedRoute>} />
                <Route path="/finance/approvals" element={<ProtectedRoute><Layout><FinanceApprovals /></Layout></ProtectedRoute>} />
                <Route path="/finance/bills" element={<ProtectedRoute><Layout><FinanceBills /></Layout></ProtectedRoute>} />
                <Route path="/finance/payroll" element={<ProtectedRoute><Layout><FinancePayroll /></Layout></ProtectedRoute>} />
                <Route path="/finance/branches" element={<ProtectedRoute><Layout><FinanceBranches /></Layout></ProtectedRoute>} />
                <Route path="/finance/reports" element={<ProtectedRoute><Layout><FinanceReports /></Layout></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
