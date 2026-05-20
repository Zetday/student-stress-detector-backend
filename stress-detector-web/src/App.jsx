import { LanguageProvider } from "./contexts/LanguageContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { Route, Routes } from "react-router-dom"

//Pages
import RegisterPage from "./pages/RegisterPages"
import LoginPage from "./pages/LoginPages"
import ResetPassword from "./pages/ResetPassword"
import NewPassword from "./pages/NewPassword"
import DashboardPage from "./pages/DashboardPages"
import Sidebar from "./components/Sidebar/Sidebar"

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/newpassword" element={<NewPassword />} />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  )
}
