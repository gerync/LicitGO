import { Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import { ThemeProvider } from "./context/ThemeContext"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
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
import Settings from "./pages/Settings"

export default function App() {
  return (
    <ThemeProvider>
        <>
          {/* Globális Toast értesítések (felugró üzenetek) */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />

          <div className="min-h-screen bg-background flex flex-col text-content transition-colors duration-300">
            
            {/* fejléc */}
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auctions" element={<Auctions />} />
                <Route path="/auctions/:auctionId" element={<AuctionDetail />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/verify-2fa" element={<Verify2FA />} />
              
                {/* Védett útvonalak */}

                {/* Fos backend */}
                <Route path="/addcar" element={<AddCar />}/>
                <Route path="/AddAuction" element={<AddAuction />}/>
                <Route path="/dashboard" element={<Dashboard />}/>
                <Route path="/settings" element={<Settings />}/>

              </Routes>
            </main>
            
            {/* lábléc  */}
            <Footer />
            
          </div>
        </>
    </ThemeProvider>
  )
}