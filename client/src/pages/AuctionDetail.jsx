import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/config';
import { Loader2, ArrowLeft, Clock, Tag, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuctionDetail() {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/auction/getAuction?id=${auctionId}`, {
          method: 'GET',
        });
        
        const data = response.auction || response.data || response;
        setAuction(data);
      } catch (err) {
        console.error('Hiba a részletek betöltésekor:', err);
        setError('Nem sikerült betölteni az aukció részleteit. Lehet, hogy már törölték.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [auctionId]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/auction/placeBid', {
        method: 'POST',
        body: { auctionId, amount: Number(bidAmount) }
      });
      alert('Sikeres licit! Frissítsd az oldalt az új összeghez.');
      setBidAmount('');
    } catch (err) {
      alert(err.data?.message || 'Hiba történt a licitálás során!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-content-muted font-medium">Autó adatainak betöltése...</p>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-content mb-4">{error || "Az autó nem található!"}</h2>
        <Link to="/auctions" className="text-primary hover:text-primary-hover font-bold inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Vissza az aukciókhoz
        </Link>
      </div>
    );
  }

  const title = auction.title || auction.carName || auction.make || 'Ismeretlen autó';
  const price = auction.currentPrice || auction.startingPrice || auction.price || 0;
  const image = auction.imageUrl || auction.image || 'https://via.placeholder.com/800x600?text=Nincs+kép';
  
  const endDate = new Date(auction.endDate || auction.endTime);
  const isActive = endDate > new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/auctions" className="inline-flex items-center text-content-muted hover:text-primary transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Vissza a kínálathoz
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            {isActive ? (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm inline-flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Aktív aukció
              </span>
            ) : (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm inline-flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> Lezárult
              </span>
            )}
          </div>
          
          <h1 className="text-4xl font-extrabold text-content mb-4">{title}</h1>
          
          <p className="text-content-muted mb-8 leading-relaxed">
            {auction.description || "Ennek az autónak jelenleg nincs részletes leírása a rendszerben."}
          </p>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-content-muted font-medium mb-1">Jelenlegi licit</p>
                <p className="text-3xl font-bold text-primary">{price.toLocaleString('hu-HU')} Ft</p>
              </div>
              <div className="text-right">
                <p className="text-content-muted font-medium mb-1">Lejárat</p>
                <p className={`font-bold ${isActive ? 'text-content' : 'text-red-500'}`}>
                  {endDate.toLocaleDateString('hu-HU')}
                </p>
              </div>
            </div>

            {isActive ? (
              <form onSubmit={handleBidSubmit}>
                <label className="block text-sm font-medium text-content mb-2">Ajánlatod (Ft)</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min={price + 1000}
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min. ${(price + 1000).toLocaleString('hu-HU')}`}
                    className="flex-grow bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                  />
                  <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                    Licitálok
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 text-red-500 font-bold bg-red-500/10 rounded-lg">
                Erre az autóra már nem lehet licitálni.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}