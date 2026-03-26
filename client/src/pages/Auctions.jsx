import { useState, useEffect } from 'react';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import AuctionCard from '../components/AuctionCard';
import { apiFetch } from '../api/config';

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch('/auction/list', { method: 'GET' });
        
        const data = Array.isArray(response) ? response : response.auctions || [];
        setAuctions(data);
        setError(null);
      } catch (err) {
        console.error('Hiba az aukciók letöltésekor:', err);
        setError('Nem sikerült betölteni az aukciókat. Lehet, hogy a szerver jelenleg nem elérhető.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter(auction => {
    const title = auction.make || auction.title || auction.carName || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-content">Aktuális Aukciók</h1>
          <p className="text-content-muted mt-2">Böngéssz a legújabb licitálható autók között!</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-content-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-surface text-content placeholder-content-muted focus:ring-primary focus:border-primary transition-colors"
            placeholder="Keresés (pl. BMW)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-content-muted font-medium">Aukciók betöltése a szerverről...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-red-500 mb-1">Hoppá, valami elromlott!</h3>
          <p className="text-red-500/80">{error}</p>
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <Search className="w-12 h-12 text-content-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-content mb-2">Nincsenek találatok</h3>
          <p className="text-content-muted">Jelenleg nincs aktív aukció az adatbázisban.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction.id || auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}