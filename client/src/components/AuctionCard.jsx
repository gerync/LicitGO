import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';

export default function AuctionCard({ auction }) {
  const title = auction.car ? `${auction.car.manufacturer} ${auction.car.model}` : 'Ismeretlen autó';
  const price = auction.currentPrice || 0;
  const image = auction.car?.mainImagepath || 'https://via.placeholder.com/400x300?text=Nincs+kép';
  
  // Use the status from API (already calculated on backend) or calculate from endtime
  const isActive = auction.status === 'ongoing' || auction.status === 'Folyamatban';
  
  let timeLeftString = 'Az aukció véget ért';
  if (auction.timeRemaining !== undefined && auction.timeRemaining > 0) {
    // timeRemaining is in seconds from the backend
    const diffDays = Math.ceil(auction.timeRemaining / (60 * 60 * 24));
    timeLeftString = `Még ${diffDays} nap van hátra`;
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {isActive ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              Aktív
            </span>
          ) : (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              Lezárult
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-content mb-2 line-clamp-1">{title}</h3>
        
        <div className="mt-auto space-y-3 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-content-muted text-sm">
              <Tag className="w-4 h-4 mr-1" /> Jelenlegi licit
            </div>
            <span className="text-lg font-bold text-primary">
              {price.toLocaleString('hu-HU')} Ft
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-content-muted text-sm">
              <Clock className="w-4 h-4 mr-1" /> Hátralévő idő
            </div>
            <span className={`text-sm font-medium ${isActive ? 'text-content' : 'text-red-500'}`}>
              {timeLeftString}
            </span>
          </div>
        </div>

        <Link 
          to={`/auctions/${auction.auctionId}`}
          className="mt-6 w-full flex items-center justify-center bg-background border border-border text-content font-bold py-2 px-4 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors"
        >
          Részletek megtekintése
        </Link>
      </div>
    </div>
  );
}