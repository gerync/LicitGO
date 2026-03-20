import { useState } from 'react';
import AuctionCard from '../components/AuctionCard';
import { Search, Filter } from 'lucide-react';

export default function Auctions() {
  // --- IDEIGLENES KAMU ADATOK (Mock Data) a backend hiánya miatt ---
  const mockAuctions = [
    {
      auctionId: 1,
      status: 'ongoing',
      currentPrice: 54500,
      timeRemaining: 172800, 
      car: {
        manufacturer: 'Porsche',
        model: '911 Carrera S',
        modelyear: 2021,
        odometerKM: 12500,
        mainImagepath: 'https://images.unsplash.com/photo-1503376762365-33dea15b4206?q=80&w=800&auto=format&fit=crop'
      }
    },
    {
      auctionId: 2,
      status: 'upcoming',
      currentPrice: 0,
      timeRemaining: 345600, 
      car: {
        manufacturer: 'BMW',
        model: 'M4 Competition',
        modelyear: 2023,
        odometerKM: 3200,
        mainImagepath: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=800&auto=format&fit=crop'
      }
    },
    {
      auctionId: 3,
      status: 'ongoing',
      currentPrice: 18200,
      timeRemaining: 3600, 
      car: {
        manufacturer: 'Audi',
        model: 'RS6 Avant',
        modelyear: 2018,
        odometerKM: 85000,
        mainImagepath: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=800&auto=format&fit=crop'
      }
    },
    {
      auctionId: 4,
      status: 'ended',
      currentPrice: 125000,
      timeRemaining: 0, 
      car: {
        manufacturer: 'Mercedes-Benz',
        model: 'G63 AMG',
        modelyear: 2022,
        odometerKM: 45000,
        mainImagepath: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=800&auto=format&fit=crop'
      }
    }
  ];

  // Most a mock adatokat töltjük be a state-be a fetch helyett
  const [auctions, setAuctions] = useState(mockAuctions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Fejléc és kereső */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-content tracking-tight">Aktuális Aukciók</h1>
          <p className="text-content-muted mt-1">Találd meg a következő álomautódat.</p>
        </div>
        
        {/* Keresőmező dizájn */}
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-content-muted" />
            </div>
            <input
              type="text"
              placeholder="Keresés (pl. BMW)..."
              className="pl-9 block w-full bg-surface border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <button className="bg-surface border border-border text-content p-2.5 rounded-lg hover:bg-background transition-colors flex items-center justify-center">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grid rács a kártyáknak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {auctions.map(auction => (
          <AuctionCard key={auction.auctionId} auction={auction} />
        ))}
      </div>

      {/* Ha nincs találat */}
      {auctions.length === 0 && (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <h3 className="text-lg font-medium text-content mb-2">Nem találtunk autót</h3>
          <p className="text-content-muted">Próbálj meg más keresési feltételeket megadni.</p>
        </div>
      )}

    </div>
  );
}