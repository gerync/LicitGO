import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"


export default function Register() {
  const navigate = useNavigate()

  const [usertag, setUsertag] = useState("")
  const [password, setPassword] = useState("")
  const [passwordconfirm, setPasswordconfirm] = useState("")
  const [email, setEmail] = useState("")
  const [fullname, setFullname] = useState("")
  const [mobile, setMobile] = useState("")
  const [gender, setGender] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [pfp, setPfp] = useState(null)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== passwordconfirm) {
      setError("A két jelszó nem egyezik!")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("usertag", usertag)
      formData.append("password", password)
      formData.append("passwordconfirm", passwordconfirm)
      formData.append("email", email)
      formData.append("fullname", fullname)

    
      
      formData.append("mobile", mobile || "")
      formData.append("gender", gender || "")
      formData.append("birthdate", birthdate || "")

      if (pfp) formData.append("pfp", pfp)

      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        credentials: "include",
        body: formData
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        navigate("/check-email")
      } else {
        setError(data.error || data.message || "Regisztráció sikertelen!")
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
        <h2>Regisztráció</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Usertag (kisbetű, szám, _ )"
            value={usertag}
            onChange={(e) => setUsertag(e.target.value)}
            required
            minLength={3}
            maxLength={32}
          />

          <input
            type="text"
            placeholder="Teljes név"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Mobil (+3612345678)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <input
            type="text"
            placeholder="Nem "
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            maxLength={10}
          />

          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            placeholder="profilkép feltöltése"
            onChange={(e) => setPfp(e.target.files?.[0] || null)}
          />

          <input
            type="password"
            placeholder="Jelszó (8-32, kis/nagy, szám, speciális)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={32}
          />

          <input
            type="password"
            placeholder="Jelszó megerősítése"
            value={passwordconfirm}
            onChange={(e) => setPasswordconfirm(e.target.value)}
            required
            minLength={8}
            maxLength={32}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
        </form>

        <p>
          Van fiókod? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}