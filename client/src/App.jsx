import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { Toaster } from "react-hot-toast"

// Komponensek importálása
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"

// Oldalak importálása
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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

        {/* min-h-screen: legalább a képernyő magasságát kitölti
            flex-col: oszlopba rendezi a Navbart, a Tartalmat és a Footert
        */}
        <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
          
          {/* A fejléc minden oldalon látszik */}
          <Navbar />
          
          {/* A tartalom kitölti a maradék helyet (flex-grow), így a Footer mindig alul marad */}
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
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
              <Route path="/add-car" element={<ProtectedRoute><AddCar /></ProtectedRoute>}/>
              <Route path="/add-auction" element={<ProtectedRoute><AddAuction /></ProtectedRoute>}/>
            </Routes>
          </main>
          
          {/* A lábléc minden oldalon látszik az oldal alján */}
          <Footer />
          
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}