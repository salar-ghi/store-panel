
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import Analytics from "@/pages/Analytics";
import Promotions from "@/pages/Promotions";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Brands from "@/pages/Brands";
import Categories from "@/pages/Categories";
import Users from "@/pages/Users";
import Banners from "@/pages/Banners";
import Tags from "@/pages/Tags";
import Inventory from "@/pages/Inventory";
import InventoryLocations from "@/pages/inventory/InventoryLocations";
import InventoryInputs from "@/pages/inventory/InventoryInputs";
import ReturnedOrders from "@/pages/orders/ReturnedOrders";
import Notifications from "@/pages/notifications/Notifications";
import Messages from "@/pages/notifications/Messages";
import NotificationSettings from "@/pages/notifications/NotificationSettings";
import { useAuthStore } from "@/store/auth-store";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
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
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
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
              
              {/* Redirect /customers to /users */}
              <Route path="/customers" element={<Navigate to="/users" replace />} />
              
              <Route path="/users" element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
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
              
              <Route path="/inventory/locations" element={
                <ProtectedRoute>
                  <Layout>
                    <InventoryLocations />
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
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
