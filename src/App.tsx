import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import InventoryPage from './pages/dashboard/InventoryPage';
import AddProductPage from './pages/dashboard/AddProductPage';
import EditProductPage from './pages/dashboard/EditProductPage';
import POSPage from './pages/dashboard/POSPage';
import ReceiptsPage from './pages/dashboard/ReceiptsPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import { AuthProvider, useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/add" element={<AddProductPage />} />
              <Route path="inventory/:productId/edit" element={<EditProductPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="receipts" element={<ReceiptsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
