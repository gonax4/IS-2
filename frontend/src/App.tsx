import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import RegisterPage
  from "./pages/RegisterPage";

import VerifyEmailPage
  from "./pages/VerifyEmailPage";

import LoginPage
  from "./pages/LoginPage";

import HomePage
  from "./pages/HomePage";

import CreateReportPage
  from "./pages/CreateReportPage";

import ReportsByProblemPage
  from "./pages/ReportsByProblemPage";

import MyReportsPage
  from "./pages/MyReportsPage";

import OperatorDashboardPage
  from "./pages/OperatorDashboardPage";

import OperatorReportDetailPage
  from "./pages/OperatorReportDetailPage";

import ProtectedRoute
  from "./routes/ProtectedRoute";

import ForgotPasswordPage
  from "./pages/ForgotPasswordPage";

import ResetPasswordPage
  from "./pages/ResetPasswordPage";

import TechnicianApplicationPage
  from "./pages/TechnicianApplicationPage";

import OperatorTechnicianApplicationsPage
  from "./pages/OperatorTechnicianApplicationsPage";

import TechnicianDashboardPage
  from "./pages/TechnicianDashboardPage";

import ReportsMapPage
  from "./pages/ReportsMapPage";

import TechnicianReportDetailPage
    from "./pages/TechnicianReportDetailPage";

import TechnicianAttendPage
    from "./pages/TechnicianAttendPage";

import TechnicianClosurePage
  from "./pages/TechnicianClosurePage";

import OperatorMonitoringPage
  from "./pages/OperatorMonitoringPage";

function getDashboardByRole(
  role: string | null
) {
  if (role === "OPERATOR") {
    return "/operator";
  }

  if (role === "TECHNICIAN") {
    return "/technician";
  }

  return "/home";
}

import TechnicianFieldWorkPage
  from "./pages/TechnicianFieldWorkPage";

function PublicHomeRoute() {
  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  if (token && role === "OPERATOR") {
    return (
      <Navigate
        to="/operator"
        replace
      />
    );
  }

  if (token && role === "TECHNICIAN") {
    return (
      <Navigate
        to="/technician"
        replace
      />
    );
  }

  return <HomePage />;
}

function LoginRoute() {
  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  if (token) {
    return (
      <Navigate
        to={getDashboardByRole(role)}
        replace
      />
    );
  }

  return <LoginPage />;
}

export default function App() {

  return (

    <Routes>

      {/* Inicio ciudadano público */}
      <Route
        path="/"
        element={<PublicHomeRoute />}
      />

      <Route
        path="/home"
        element={<PublicHomeRoute />}
      />
      
      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/login"
        element={<LoginRoute />}
      />

      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      <Route
        path="/technician/apply"
        element={<TechnicianApplicationPage />}
      />

      <Route
        path="/reports/create"
        element={
          <ProtectedRoute>
            <CreateReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/problem/:problemType"
        element={<ReportsByProblemPage />}
      />

      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <MyReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRoles={["OPERATOR"]}>
            <OperatorDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/monitoring"
        element={
          <ProtectedRoute allowedRoles={["OPERATOR"]}>
            <OperatorMonitoringPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/report/:id"
        element={
          <ProtectedRoute allowedRoles={["OPERATOR"]}>
            <OperatorReportDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/technician-applications"
        element={
          <ProtectedRoute allowedRoles={["OPERATOR"]}>
            <OperatorTechnicianApplicationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
            <TechnicianDashboardPage />
          </ProtectedRoute>
          }
        />

        <Route
          path="/technician/reports/:id"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianReportDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/reports/:id/attend"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianAttendPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/reports/:id/fieldwork"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianFieldWorkPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/reports/:id/closure"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianClosurePage />
            </ProtectedRoute>
          }
        />
      
      <Route
        path="/reports/map"
        element={<ReportsMapPage />}
      />
      
      <Route
        path="*"
        element={
          <Navigate to="/" />
        }
      />

    </Routes>

  );
}