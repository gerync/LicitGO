import { Link } from "react-router-dom";
import { Clock, Tag, Gauge } from "lucide-react";

export default function AuctionCard({ auction }) {
  const car = auction.car || {};

  const getStatusColor = (status) => {
    if (status === 'ongoing') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'upcoming') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    if (status === 'ongoing') return 'Aktív';
    if (status === 'upcoming') return 'Hamarosan';
    return 'Lezárult';
  };

  return (
    <Link to={`/auctions/${auction.auctionId}`} className="group bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* Kép és Státusz */}
      <div className="relative h-56 w-full overflow-hidden bg-background">
        {car.mainImagepath ? (
          <img
            src={car.mainImagepath}
            alt={`${car.manufacturer} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-content-muted font-medium">
            Nincs kép
          </div>
        )}
        
        {/* Státusz Badge  */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(auction.status)} shadow-sm`}>
          {getStatusText(auction.status)}
        </div>
      </div>

      {/* Adatok */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-content mb-3 line-clamp-1">
          {car.manufacturer} {car.model}
        </h3>

        {/* Kis infók, évjárat és KM */}
        <div className="flex items-center gap-4 text-sm text-content-muted mb-5">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" /> {car.modelyear || "-"}
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4" /> {car.odometerKM ? `${car.odometerKM.toLocaleString()} km` : "-"}
          </div>
        </div>

        {/* Ár és Idő  */}
        <div className="mt-auto border-t border-border pt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-content-muted uppercase font-semibold tracking-wider mb-1">Jelenlegi ár</p>
            <p className="text-2xl font-extrabold text-primary">
              {auction.currentPrice ? `${auction.currentPrice.toLocaleString()} $` : "0 $"}
            </p>
          </div>
          <div className="text-right">
             <p className="text-xs text-content-muted mb-1 flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" /> Hátralévő idő
             </p>
             <p className="text-sm font-bold text-content">
              {formatTime(auction.timeRemaining)}
             </p>
          </div>
        </div>
      </div>

    </Link>
  );
}

function formatTime(seconds) {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds <= 0) return "Lezárult";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} nap ${hours} óra`;
  if (hours > 0) return `${hours} óra ${minutes} perc`;
  return `${minutes} perc`;
}