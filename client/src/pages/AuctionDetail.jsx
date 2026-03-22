import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Clock, Tag, Gauge, Calendar, Fuel, Settings, Zap, 
  CarFront, Scale, ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AuctionDetail() {
  const { auctionId } = useParams(); 

  const [auction, setAuction] = useState(mockAuction);
  const [mainImage, setMainImage] = useState(mockAuction.images[0]);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);

  const handleBid = (e) => {
    e.preventDefault();
    const bidValue = Number(bidAmount);

    if (bidValue <= auction.currentPrice) {
      toast.error(`A licitnek nagyobbnak kell lennie, mint a jelenlegi ár (${auction.currentPrice} $)!`);
      return;
    }

    setIsBidding(true);
    setTimeout(() => {
      setAuction(prev => ({
        ...prev,
        currentPrice: bidValue,
        bidsCount: prev.bidsCount + 1
      }));
      setBidAmount('');
      toast.success("Sikeres licit!");
      setIsBidding(false);
    }, 800);
  };

  const fuelTypes = { gasoline: 'Benzin', diesel: 'Dízel', electric: 'Elektromos', hybrid: 'Hibrid' };
  const transmissions = { manual: 'Manuális', automatic: 'Automata' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Vissza gomb */}
      <Link to="/auctions" className="inline-flex items-center text-content-muted hover:text-primary transition-colors font-medium mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Vissza az aukciókhoz
      </Link>

      {/*  Fejléc */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-content tracking-tight">
          {auction.car.manufacturer} {auction.car.model}
        </h1>
        <p className="text-xl text-content-muted mt-2">
          {auction.car.modelyear} • {auction.car.odometerKM.toLocaleString()} km • {fuelTypes[auction.car.fueltype]}
        </p>
      </div>

      {/* KÉPGALÉRIA */}
      <div className="mb-12">
        {/* Nagy főkép */}
        <div className="w-full h-[50vh] md:h-[65vh] rounded-2xl overflow-hidden bg-background mb-4 border border-border shadow-sm">
          <img src={mainImage} alt="Main car view" className="w-full h-full object-cover" />
        </div>
        {/* Kis képek (Thumbnails) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {auction.images.map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => setMainImage(img)}
              className={`aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${mainImage === img ? 'border-primary shadow-md opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        

      </div>
    </div>
  );
}