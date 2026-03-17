import { useEffect, useState } from "react"
import AuctionCard from "../components/AuctionCard"

export default function Auctions() {
  const [auctions, setAuctions] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("http://localhost:3000/auction/list", {
          method: "GET",
          credentials: "include"
        })

        const data = await res.json().catch(() => ({}))

        if (res.ok) {
          setAuctions(data.auctions || [])
        } else {
          setError(data.error || data.message || "Az aukciók betöltése sikertelen!")
        }
      } catch {
        setError("Szerver hiba")
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [])

  return (
    <div className="page-section">
      <div className="page-header">
        <h1>Aukciók</h1>
        <p>Nézd meg az elérhető autó aukciókat.</p>
      </div>

      {loading && <div className="auth-card">Betöltés...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && auctions.length === 0 && (
        <div className="auth-card">Jelenleg nincs elérhető aukció.</div>
      )}

      {!loading && !error && auctions.length > 0 && (
        <div className="auction-grid">
          {auctions.map((auction) => (
            <AuctionCard key={auction.auctionId} auction={auction} />
          ))}
        </div>
      )}
    </div>
  )
}