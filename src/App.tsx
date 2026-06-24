import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RiderDashboard } from "./pages/RiderDashboard";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { TrackOrder } from "./pages/TrackOrder";
import { AdminLogin } from "./pages/AdminLogin";

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "rider":
      return <Navigate to="/rider" replace />;
    case "customer":
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Layout><Login /></Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Layout><Register /></Layout>
          </PublicRoute>
        }
      />
      <Route path="/cart" element={<Layout><Cart /></Layout>} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Layout><Checkout /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rider"
        element={
          <ProtectedRoute roles={["rider"]}>
            <RiderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/adminaddid" element={<AdminLogin />} />
      <Route path="/track-order" element={<Layout><TrackOrder /></Layout>} />
      <Route path="/dashboard-redirect" element={<DashboardRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
