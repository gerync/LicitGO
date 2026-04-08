import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/config';
import { Loader2 } from 'lucide-react';

export default function CarDetail() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/cars/${carId}`, { method: 'GET' });
        setCar(res.car || null);
        setError(null);
      } catch (err) {
        setError('Nem sikerült betölteni az autót.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  if (isLoading) return (
    <div className="p-12 text-center bg-surface border border-border rounded-xl">
      <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
      <div>Autó betöltése...</div>
    </div>
  );

  if (error || !car) return (
    <div className="p-12 text-center bg-red-50 border border-red-200 rounded-xl text-red-600">{error || 'Autó nem található.'}</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <img src={car.images?.[0] || 'https://via.placeholder.com/800x600?text=Nincs+kép'} alt={`${car.manufacturer} ${car.model}`} className="w-full rounded-lg object-cover" />
          </div>
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold mb-2">{car.manufacturer} {car.model}</h1>
            <p className="text-content-muted mb-4">{car.modelyear} • {car.odometerKM ? `${car.odometerKM} km` : ''}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>Szín: <strong className="ml-2">{car.color || '—'}</strong></div>
              <div>Váltó: <strong className="ml-2">{car.transmission || '—'}</strong></div>
              <div>Hengerűrtartalom: <strong className="ml-2">{((car.enginecapacityCC ?? car.enginecapacity) || '—')} cm³</strong></div>
              <div>Teljesítmény: <strong className="ml-2">{car.efficiency ?? '—'} {car.efficiencyunit || ''}</strong></div>
              <div>Ajtók: <strong className="ml-2">{car.doors ?? '—'}</strong></div>
              <div>Ülések: <strong className="ml-2">{car.seats ?? '—'}</strong></div>
              <div>Végsebesség: <strong className="ml-2">{car.maxspeedKMH ?? '—'} km/h</strong></div>
              <div>0–100 km/h: <strong className="ml-2">{car.zeroToHundredSec ?? '—'} s</strong></div>
              <div>Károsanyag: <strong className="ml-2">{car.emissionsGKM ?? '—'} g/km</strong></div>
              <div>Súly: <strong className="ml-2">{car.weightKG ?? '—'} kg</strong></div>
              <div>VIN: <strong className="ml-2">{car.vin || '—'}</strong></div>
              <div>Gyári extrák: <strong className="ml-2">{car.factoryExtras || '—'}</strong></div>
            </div>

            <h3 className="mt-6 font-bold">Felszereltség</h3>
            <ul className="list-disc pl-5">{(Array.isArray(car.features) ? car.features : (car.features ? String(car.features).split(',').map(s => s.trim()).filter(Boolean) : [])).map((f, i) => <li key={i}>{f}</li>)}</ul>

            <h3 className="mt-6 font-bold">Képek</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {car.images?.map((img, i) => (
                <img key={i} src={img} alt={`img-${i}`} className="w-full h-28 object-cover rounded-md" />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-content-muted">Hirdető: <strong className="ml-2">{car.owner?.usertag || car.owner?.usertag || '—'}</strong></div>
              <a href={`/addauction?carId=${car.id}`} className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-hover">Indíts aukció</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
