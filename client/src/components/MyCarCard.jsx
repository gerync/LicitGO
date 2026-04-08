import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function MyCarCard({ car }) {
  const carId = car?.id || car?.carId || '';
  const title = car ? `${car.manufacturer || ''} ${car.model || ''}`.trim() || 'Ismeretlen autó' : 'Ismeretlen autó';
  const image = car?.mainImagepath || 'https://via.placeholder.com/400x300?text=Nincs+kép';

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden flex items-center justify-center bg-background">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-content mb-2 line-clamp-1">{title}</h3>
        <p className="text-content-muted text-sm mb-4">{car?.modelyear || ''} • {car?.odometerKM ? `${car.odometerKM} km` : ''}</p>

        <div className="mt-auto space-y-3 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-content-muted text-sm">
              <Car className="w-4 h-4 mr-1" /> Saját autó
            </div>
            <span className="text-sm font-medium text-content">—</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to={carId ? `/cars/${carId}` : '/addcar'}
            className="w-full flex items-center justify-center bg-background border border-border text-content font-bold py-2 px-4 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            Részletek
          </Link>

          <Link
            to={carId ? `/addauction?carId=${carId}` : '/addcar'}
            className="w-full flex items-center justify-center bg-primary text-white rounded-lg font-bold py-2 px-4 hover:bg-primary-hover transition-colors"
          >
            Indíts aukció
          </Link>
        </div>
      </div>
    </div>
  );
}
