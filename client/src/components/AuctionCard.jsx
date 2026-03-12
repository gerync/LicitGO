import { Link } from "react-router-dom"

export default function AuctionCard({ auction }) {
  const car = auction.car || {}

  return (
    <Link to={`/auctions/${auction.auctionId}`} className="auction-card">
      <div className="auction-image-wrapper">
        {car.mainImagepath ? (
          <img
            src={car.mainImagepath}
            alt={`${car.manufacturer || ""} ${car.model || ""}`}
            className="auction-image"
          />
        ) : (
          <div className="auction-image-placeholder">Nincs kép</div>
        )}

        <div className={`auction-status badge-${auction.status}`}>
          {auction.status}
        </div>
      </div>

      <div className="auction-content">
        <h3>
          {car.manufacturer} {car.model}
        </h3>

        <p>
          {car.modelyear || "-"} • {car.odometerKM || "-"} km
        </p>

        <p><strong>Ár:</strong> {auction.currentPrice}</p>
        <p><strong>Licit:</strong> {auction.bidCount}</p>
        <p><strong>Hátralévő idő:</strong> {formatTime(auction.timeRemaining)}</p>
      </div>
    </Link>
  )
}

function formatTime(seconds) {
  if (seconds === undefined || seconds === null) return "-"
  if (seconds <= 0) return "Lezárult"

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days} nap ${hours} óra`
  if (hours > 0) return `${hours} óra ${minutes} perc`
  return `${minutes} perc`
}