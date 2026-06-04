import { LanguageProvider } from "./contexts/LanguageContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { Route, Routes } from "react-router-dom"

//Pages
import RegisterPage from "./pages/RegisterPages"
import LoginPage from "./pages/LoginPages"
import ResetPassword from "./pages/ResetPassword"
import NewPassword from "./pages/NewPassword"
import DashboardPage from "./pages/DashboardPages"
import LogActivitiesPage from "./pages/LogActivitiesPages"
import ActivityHistoryPage from "./pages/ActivityHistoryPage"
import InsightPage from "./pages/InsightsPage"
import ProfilePage from "./pages/ProfilePage"
import ProtectedRoute from "../src/contexts/ProtectedRoute"


export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/newpassword" element={<NewPassword />} />
          <Route path="/reset-password" element={<NewPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/LogActivity" element={<LogActivitiesPage />} />
            <Route path="/LogActivity/:id" element={<LogActivitiesPage />} />
            <Route path="/activity-history" element={<ActivityHistoryPage />} />
            <Route path="/Insight" element={<InsightPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  )
}
