import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';

export default function AuctionCard({ auction }) {
  const title = auction.title || auction.carName || auction.make || 'Ismeretlen autó';
  const price = auction.currentPrice || auction.startingPrice || auction.price || 0;
  const image = auction.imageUrl || auction.image || 'https://via.placeholder.com/400x300?text=Nincs+kép';
  
  const endDate = new Date(auction.endDate || auction.endTime);
  const now = new Date();
  const isActive = endDate > now; 

  const diffTime = Math.abs(endDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const timeLeftString = isActive ? `Még ${diffDays} nap van hátra` : 'Az aukció véget ért';

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
          to={`/auctions/${auction.id || auction._id}`}
          className="mt-6 w-full flex items-center justify-center bg-background border border-border text-content font-bold py-2 px-4 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors"
        >
          Részletek megtekintése
        </Link>
      </div>
    </div>
  );
}