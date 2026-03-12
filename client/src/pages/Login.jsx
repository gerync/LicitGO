import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Auth.css"

export default function Login() {
  const navigate = useNavigate()
  const { syncFromCookies } = useAuth()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [keeplogin, setKeeplogin] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier,
          password,
          keeplogin
        })
      })

      const data = await res.json().catch(() => ({}))

      // 2FA REQUIRED
      if (res.status === 203 && data.temp_token) {
        sessionStorage.setItem("tfa_temp_token", data.temp_token)
        sessionStorage.setItem("tfa_keeplogin", keeplogin ? "true" : "false")
        navigate("/verify-2fa")
        return
      }

      if (res.ok) {
        // cookie usertag már be van állítva
        syncFromCookies()
        navigate("/dashboard")
      } else {
        setError(data.error || data.message || "Hibás azonosító vagy jelszó!")
      }
    } catch {
      setError("Szerver hiba")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email / usertag / mobil"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={keeplogin}
              onChange={(e) => setKeeplogin(e.target.checked)}
            />
            Emlékezz rám
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>

        <p>
          Nincs fiókod? <Link to="/register">Regisztráció</Link>
        </p>
      </div>
    </div>
  )
}