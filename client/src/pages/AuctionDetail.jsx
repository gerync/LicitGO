import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Clock, Tag, Gauge, Calendar, Fuel, Settings, Zap, 
  CarFront, Scale, ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AuctionDetail() {
  const { auctionId } = useParams(); 

  // --- IDEIGLENES KAMU ADATOK (Mock Data) a backend hiánya miatt ---
  const mockAuction = {
    auctionId: auctionId,
    status: 'ongoing',
    currentPrice: 54500,
    startingBid: 40000,
    reservePrice: 50000,
    timeRemaining: 172800, 
    bidsCount: 12,
    car: {
      manufacturer: 'Porsche',
      model: '911 Carrera S',
      modelyear: 2021,
      color: 'Fekete',
      vin: 'WP0ZZZ99ZLS123456',
      description: 'Garázsban tartott, megkímélt állapotú Porsche 911 Carrera S. Végig márkaszervizben karbantartott, friss műszakival. Az autó sérülésmentes, a festékréteg mindenhol gyári vastagságú.',
      odometerKM: 12500,
      enginecapacity: 2981,
      fueltype: 'gasoline',
      transmission: 'automatic',
      efficiency: 331,
      efficiencyunit: 'kW',
      maxspeedKMH: 308,
      zeroToHundredSec: 3.7,
      bodytype: 'coupe',
      doors: 2,
      seats: 4,
      weightKG: 1515,
    },
    images: [
      'https://images.unsplash.com/photo-1503376762365-33dea15b4206?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&auto=format&fit=crop'
    ]
  };

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
        
        <div className="lg:col-span-2 space-y-10">
          
          {/* Specifikációk */}
          <section>
            <h2 className="text-2xl font-bold text-content mb-6 border-b border-border pb-3">Jármű specifikációi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Tag className="w-4 h-4 mr-1"/> Évjárat</span><span className="font-semibold text-lg">{auction.car.modelyear}</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Gauge className="w-4 h-4 mr-1"/> Kilométeróra</span><span className="font-semibold text-lg">{auction.car.odometerKM.toLocaleString()} km</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Fuel className="w-4 h-4 mr-1"/> Üzemanyag</span><span className="font-semibold text-lg">{fuelTypes[auction.car.fueltype] || auction.car.fueltype}</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Settings className="w-4 h-4 mr-1"/> Váltó</span><span className="font-semibold text-lg">{transmissions[auction.car.transmission] || auction.car.transmission}</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Zap className="w-4 h-4 mr-1"/> Teljesítmény</span><span className="font-semibold text-lg">{auction.car.efficiency} {auction.car.efficiencyunit}</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><CarFront className="w-4 h-4 mr-1"/> Kivitel</span><span className="font-semibold text-lg capitalize">{auction.car.bodytype}</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Scale className="w-4 h-4 mr-1"/> Súly</span><span className="font-semibold text-lg">{auction.car.weightKG} kg</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Calendar className="w-4 h-4 mr-1"/> Alvázszám</span><span className="font-semibold text-lg">{auction.car.vin}</span></div>
              <div className="flex flex-col"><span className="text-content-muted text-sm flex items-center mb-1"><Tag className="w-4 h-4 mr-1"/> Szín</span><span className="font-semibold text-lg">{auction.car.color}</span></div>
            </div>
          </section>

          {/* Leírás szöveg */}
          <section>
            <h2 className="text-2xl font-bold text-content mb-6 border-b border-border pb-3">Eladó leírása</h2>
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <p className="text-content leading-relaxed whitespace-pre-line">
                {auction.car.description}
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface border border-border rounded-2xl p-6 shadow-lg">
            
            {/* Visszaszámláló */}
            <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
              <div className="flex items-center text-content-muted font-medium">
                <Clock className="w-5 h-5 mr-2" /> Hátralévő idő
              </div>
              <div className="text-xl font-bold text-red-500">
                2 nap 10 óra
              </div>
            </div>

            {/* Jelenlegi ár */}
            <div className="mb-6">
              <p className="text-sm text-content-muted uppercase tracking-wider font-semibold mb-1">Jelenlegi Legmagasabb Licit</p>
              <div className="text-4xl font-extrabold text-primary">
                {auction.currentPrice.toLocaleString()} $
              </div>
              <p className="text-sm text-content-muted mt-2">
                Eddigi licitek száma: <span className="font-semibold text-content">{auction.bidsCount}</span>
              </p>
            </div>

            {/* Minimálár visszajelzés */}
            {auction.reservePrice && (
              <div className={`flex items-center text-sm font-medium mb-6 p-3 rounded-lg border ${auction.currentPrice >= auction.reservePrice ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                {auction.currentPrice >= auction.reservePrice ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> A minimálárat elértük!</>
                ) : (
                  <><AlertCircle className="w-4 h-4 mr-2" /> A minimálárat még nem értük el.</>
                )}
              </div>
            )}

            {/* Licitáló Input és Gomb */}
            <form onSubmit={handleBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-content mb-1">A te ajánlatod ($)</label>
                <input 
                  type="number" 
                  required
                  min={auction.currentPrice + 100} // Minimum a jelenlegi ár felett egy picit
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min. ${(auction.currentPrice + 100).toLocaleString()} $`}
                  className="w-full bg-background border border-border rounded-lg p-3 text-xl font-bold text-content focus:ring-primary focus:border-primary"
                />
              </div>
              <button 
                type="submit" 
                disabled={isBidding}
                className="w-full py-4 rounded-xl font-bold text-lg text-white bg-primary hover:bg-primary-hover shadow-md transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {isBidding ? 'Feldolgozás...' : 'Licitálok'}
              </button>
            </form>

            <p className="text-xs text-center text-content-muted mt-4">
              A licitálással elfogadod az Általános Szerződési Feltételeket. A licit kötelező érvényű ajánlatnak minősül.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}