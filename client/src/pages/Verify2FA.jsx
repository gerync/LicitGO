import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"


export default function Verify2FA() {
  const navigate = useNavigate()
  const { syncFromCookies } = useAuth()

  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const tempToken = sessionStorage.getItem("tfa_temp_token")
    const keeplogin = sessionStorage.getItem("tfa_keeplogin") === "true"

    if (!tempToken) {
      setError("Hiányzik a 2FA token. Jelentkezz be újra!")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("https://api.licitgo.com/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
        credentials: "include",
        body: JSON.stringify({
          code,
          keeplogin
        })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        sessionStorage.removeItem("tfa_temp_token")
        sessionStorage.removeItem("tfa_keeplogin")

        syncFromCookies()
        navigate("/dashboard")
      } else {
        setError(data.error || data.message || "Hibás vagy lejárt kód!")
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
        <h2>2FA megerősítés</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="6 jegyű kód"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ellenőrzés..." : "Megerősítés"}
          </button>
        </form>
      </div>
    </div>
  )
}