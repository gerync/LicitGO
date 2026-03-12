import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Auth.css"

export default function AddAuction() {
  const navigate = useNavigate()

  const [carid, setCarid] = useState("")
  const [startingBid, setStartingBid] = useState("")
  const [reservePrice, setReservePrice] = useState("")
  const [starttime, setStarttime] = useState("")
  const [endtime, setEndtime] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddAuction = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("http://localhost:3000/auction/addauction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          carid: Number(carid),
          startingBid: Number(startingBid),
          reservePrice: Number(reservePrice),
          starttime,
          endtime
        })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSuccess(data.message || "Auction sikeresen létrehozva!")
        navigate("/dashboard")
      } else {
        setError(data.error || data.message || "Auction létrehozása sikertelen!")
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
        <h2>Add Auction</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleAddAuction}>
          <input
            type="number"
            placeholder="Car ID"
            value={carid}
            onChange={(e) => setCarid(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Starting Bid"
            value={startingBid}
            onChange={(e) => setStartingBid(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Reserve Price"
            value={reservePrice}
            onChange={(e) => setReservePrice(e.target.value)}
            required
          />

          <input
            type="datetime-local"
            value={starttime}
            onChange={(e) => setStarttime(e.target.value)}
            required
          />

          <input
            type="datetime-local"
            value={endtime}
            onChange={(e) => setEndtime(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Létrehozás..." : "Add Auction"}
          </button>
        </form>
      </div>
    </div>
  )
}