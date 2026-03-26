import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/config';
import { Loader2, PlusCircle, Car, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [myAuctions, setMyAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch('/user/profile', { method: 'GET' });
        
        const userCars = response.cars || response.auctions || response.data?.auctions || [];
        setMyAuctions(userCars);
        setError(null);
      } catch (err) {
        console.error('Hiba a profil betöltésekor:', err);
        setError('Nem sikerült betölteni a saját aukcióidat a szerverről.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary uppercase">
              {user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-content">
              Üdvözlünk, {user?.username || 'Felhasználó'}!
            </h1>
            <p className="text-content-muted">Itt kezelheted a fiókodat és az aukcióidat.</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Link 
            to="/settings" 
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-border rounded-lg text-content font-medium hover:bg-background transition-colors"
          >
            <SettingsIcon className="w-4 h-4 mr-2" /> Beállítások
          </Link>
          <Link 
            to="/addcar" 
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Új autó
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-content flex items-center">
            <Car className="w-6 h-6 mr-2 text-primary" />
            Saját Autóim ({myAuctions.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-content-muted font-medium">Adataid betöltése folyamatban...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-500 mb-1">Hoppá!</h3>
            <p className="text-red-500/80">{error}</p>
          </div>
        ) : myAuctions.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-content-muted" />
            </div>
            <h3 className="text-lg font-bold text-content mb-2">Még nincsenek autóid</h3>
            <p className="text-content-muted mb-6 max-w-md mx-auto">
              Jelenleg egyetlen autót sem hirdetsz. Töltsd fel az első járművedet, és indítsd el az aukciót!
            </p>
            <Link 
              to="/addcar" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-md"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Első autóm feltöltése
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAuctions.map((auction) => (
              <AuctionCard key={auction.id || auction._id} auction={auction} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}