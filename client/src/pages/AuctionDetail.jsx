import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function AuctionDetail() {
  const { auctionId } = useParams()
  const { user } = useAuth()

  const [auction, setAuction] = useState(null)
  const [bidamount, setBidamount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [bidLoading, setBidLoading] = useState(false)

  const fetchAuction = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(`http://localhost:3000/auction/${auctionId}`, {
        method: "GET",
        credentials: "include"
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setAuction(data.auction)
      } else {
        setError(data.error || data.message || "Az aukció betöltése sikertelen!")
      }
    } catch {
      setError("Szerver hiba")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuction()
  }, [auctionId])

  const handleBid = async (e) => {
    e.preventDefault()
    setBidLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`http://localhost:3000/auction/${auctionId}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          bidamount: Number(bidamount)
        })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSuccess(data.message || "Sikeres licit!")
        setBidamount("")
        fetchAuction()
      } else {
        setError(data.error || data.message || "A licit sikertelen!")
      }
    } catch {
      setError("Szerver hiba")
    } finally {
      setBidLoading(false)
    }
  }

  if (loading) {
    return <div className="page-section"><div className="auth-card">Betöltés...</div></div>
  }

  if (error && !auction) {
    return <div className="page-section"><div className="error">{error}</div></div>
  }

  if (!auction) {
    return <div className="page-section"><div className="auth-card">Az aukció nem található.</div></div>
  }

  const car = auction.car || {}

  return (
    <div className="page-section">
      <div className="detail-layout">
        <div className="detail-left">
          {car.images && car.images.length > 0 ? (
            <img
              src={car.images[0]}
              alt={`${car.manufacturer || ""} ${car.model || ""}`}
              className="detail-main-image"
            />
          ) : (
            <div className="detail-main-image placeholder-detail">Nincs kép</div>
          )}
        </div>

        <div className="detail-right">
          <h1>{car.manufacturer} {car.model}</h1>

          <div className="detail-box">
            <p><strong>Évjárat:</strong> {car.modelyear}</p>
            <p><strong>Kilométer:</strong> {car.odometerKM} km</p>
            <p><strong>Szín:</strong> {car.color}</p>
            <p><strong>Üzemanyag:</strong> {car.fueltype}</p>
            <p><strong>Váltó:</strong> {car.transmission}</p>
            <p><strong>Karosszéria:</strong> {car.bodytype}</p>
            <p><strong>Ajtók:</strong> {car.doors}</p>
            <p><strong>Ülések:</strong> {car.seats}</p>
            <p><strong>Ár:</strong> {auction.currentPrice}</p>
            <p><strong>Licit szám:</strong> {auction.bidCount}</p>
            <p><strong>Státusz:</strong> {auction.status}</p>
            <p><strong>Reserve met:</strong> {auction.reserveMet ? "Igen" : "Nem"}</p>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {user ? (
            <form onSubmit={handleBid} className="bid-form">
              <input
                type="number"
                placeholder="Licit összege"
                value={bidamount}
                onChange={(e) => setBidamount(e.target.value)}
                required
              />
              <button type="submit" disabled={bidLoading}>
                {bidLoading ? "Licitálás..." : "Licit leadása"}
              </button>
            </form>
          ) : (
            <div className="auth-card">
              Jelentkezz be, ha licitálni szeretnél.
            </div>
          )}
        </div>
      </div>

      <div className="detail-history">
        <h2>Licit történet</h2>

        {auction.bidHistory && auction.bidHistory.length > 0 ? (
          <div className="history-list">
            {auction.bidHistory.map((bid, index) => (
              <div key={index} className="history-item">
                <span><strong>{bid.bidder}</strong></span>
                <span>{bid.amount}</span>
                <span>{new Date(bid.bidtime).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="auth-card">Még nincs licit.</div>
        )}
      </div>
    </div>
  )
}