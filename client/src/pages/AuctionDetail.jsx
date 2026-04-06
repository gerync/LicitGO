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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // debug: trace renders to diagnose runtime error
  try {
    // harmless logging; stringify to avoid circular issues
    // eslint-disable-next-line no-console
    console.log('AuctionDetail render', { auctionId, auctionPreview: auction ? { auctionId: auction.auctionId, carImages: auction.car?.images?.length } : null, currentImageIndex });
  } catch (e) {
    // ignore
  }

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/auction/${auctionId}`, {
          method: 'GET',
        });
        
        const data = response.auction || response.data || response;
        setAuction(data);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Hiba a részletek betöltésekor:', err);
        setError('Nem sikerült betölteni az aukció részleteit. Lehet, hogy már törölték.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [auctionId]);

  // reset image index when images change on the loaded auction
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [auction?.car?.images?.length]);

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

  const placeholder = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F048%2F910%2F778%2Fnon_2x%2Fdefault-image-missing-placeholder-free-vector.jpg&f=1&nofb=1&ipt=4354cddad33ae8d882b4892ca99e72e4d423258fb5b1a685d1b36308285f4a8e';

  let rendered;
  try {
    // compute derived values inside try so any unexpected structure in `auction` is caught
    const title = auction.title || (auction.car && `${auction.car.manufacturer || ''} ${auction.car.model || ''}`.trim()) || auction.carName || auction.make || 'Ismeretlen autó';
    const price = (auction.currentPrice ?? auction.startingPrice ?? auction.price ?? 0);

    const rawImages = (auction.car && Array.isArray(auction.car.images) && auction.car.images.length > 0)
      ? auction.car.images
      : auction.car && auction.car.mainImagepath ? [auction.car.mainImagepath]
      : auction.imageUrl ? [auction.imageUrl]
      : auction.image ? [auction.image]
      : [];
    const images = rawImages.filter(img => typeof img === 'string' && img.trim().length > 0);
    const image = images.length > 0 ? images[currentImageIndex % images.length] : placeholder;

    

    const endDate = new Date(auction.endtime || auction.endTime || auction.endDate);
    const isActive = endDate > new Date();

    // Safe price formatting
    const priceNumber = Number(typeof price === 'string' ? price.replace(/[^0-9.-]+/g, '') : price) || 0;
    const priceDisplay = priceNumber.toLocaleString('hu-HU');

    // Safe features string
    const featuresText = auction.car && auction.car.features
      ? (Array.isArray(auction.car.features) ? auction.car.features.join(', ') : (typeof auction.car.features === 'string' ? auction.car.features : JSON.stringify(auction.car.features)))
      : '-';

    // Safe description
    const descriptionText = auction.description && typeof auction.description === 'string' ? auction.description : (auction.description ? JSON.stringify(auction.description) : 'Ennek az autónak jelenleg nincs részletes leírása a rendszerben.');
    rendered = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/auctions" className="inline-flex items-center text-content-muted hover:text-primary transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Vissza a kínálathoz
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <img
              src={(images && images.length > 0) ? images[currentImageIndex % images.length] : placeholder}
              alt={title}
              className="w-full h-full object-cover"
              style={{ maxHeight: 520, width: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
            />

            {images && images.length > 1 && (
              <div className="p-3 bg-background flex gap-2 overflow-x-auto mt-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-none rounded-md overflow-hidden border ${currentImageIndex===idx? 'ring-2 ring-primary': 'border-border'}`}
                    style={{ width: 112 }}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full"
                      style={{ height: 70, objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
                    />
                  </button>
                ))}
              </div>
            )}
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
              {descriptionText}
            </p>

            {/* Car details */}
            {auction.car && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">Autó adatai</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Gyártó:</strong> {auction.car.manufacturer || '-'}</div>
                  <div><strong>Modell:</strong> {auction.car.model || '-'}</div>
                  <div><strong>Évjárat:</strong> {auction.car.modelyear || '-'}</div>
                  <div><strong>Futott km:</strong> {auction.car.odometerKM || '-'}</div>
                  <div><strong>Üzemanyag:</strong> {auction.car.fueltype || '-'}</div>
                  <div><strong>Váltó:</strong> {auction.car.transmission || '-'}</div>
                  <div><strong>Szín:</strong> {auction.car.color || '-'}</div>
                  <div><strong>Ajtók:</strong> {auction.car.doors || '-'}</div>
                  <div><strong>VIN:</strong> {auction.car.vin || '-'}</div>
                  <div><strong>Tulajdonos:</strong> {auction.car.owner?.usertag || '-'}</div>
                  <div className="col-span-2"><strong>Funkciók:</strong> {Array.isArray(auction.car.features) ? auction.car.features.join(', ') : (typeof auction.car.features === 'string' ? auction.car.features : (auction.car.features ? JSON.stringify(auction.car.features) : '-'))}</div>
                  <div className="col-span-2"><strong>Gyári extrák:</strong> {typeof auction.car.factoryExtras === 'string' ? auction.car.factoryExtras : (auction.car.factoryExtras ? JSON.stringify(auction.car.factoryExtras) : '-')}</div>
                  <div><strong>Max sebesség (km/h):</strong> {auction.car.maxspeedKMH || '-'}</div>
                  <div><strong>0-100 (s):</strong> {auction.car.zeroToHundredSec || '-'}</div>
                </div>
              </div>
            )}

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-content-muted font-medium mb-1">Jelenlegi licit</p>
                  <p className="text-3xl font-bold text-primary">{Number(price).toLocaleString('hu-HU')} Ft</p>
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
                      min={Number(price) + 1000}
                      required
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min. ${(Number(price) + 1000).toLocaleString('hu-HU')}`}
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
  } catch (e) {
    // Log the full error to the console so we can see the real problem in production builds
    // eslint-disable-next-line no-console
    console.error('AuctionDetail render error', e);
    rendered = (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">Hiba történt az oldal renderelése során.</h2>
        <pre className="whitespace-pre-wrap text-left text-sm">{String(e && e.message)}</pre>
      </div>
    );
  }
  return rendered;
}