import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Verify2FA from "./pages/Verify2FA"
import CheckEmail from "./pages/CheckEmail"
import Dashboard from "./pages/Dashboard"
import Auctions from "./pages/Auctions"
import AddCar from "./pages/AddCar"
import AddAuction from "./pages/AddAuction"
import AuctionDetail from "./pages/AuctionDetail"

import "./styles/Auth.css"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <div className="page-container">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:auctionId" element={<AuctionDetail />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
          
            <Route path="/dashboard"element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
            <Route path="/add-car"element={<ProtectedRoute><AddCar /></ProtectedRoute>}/>
            <Route path="/add-auction"element={<ProtectedRoute><AddAuction /></ProtectedRoute>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}