import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import "../styles/Auth.css"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate("/")
  }

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="nav-button">LicitGo</Link>
      </div>

      <div className="navbar-right">

        {/* PUBLIC NAV */}
        {!user && (
          <>
            <Link to="/auctions" className="nav-button">Auctions</Link>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/register" className="nav-button">Register</Link>
            
          </>
        )}

        {/* LOGGED IN NAV */}
        {user && (
          <>
            <Link to="/auctions" className="nav-button">Auctions</Link>
            <Link to="/add-car" className="nav-button">Add Car</Link>
            <Link to="/add-auction" className="nav-button">Add Auction</Link>

            <div className="user-circle" onClick={() => setOpen(!open)}>
              {user.usertag?.charAt(0)?.toUpperCase()}

              {open && (
                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  <div onClick={() => { setOpen(false); navigate("/dashboard") }}>
                    Dashboard
                  </div>

                  <div onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}