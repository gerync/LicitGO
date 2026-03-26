import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6 bg-surface p-10 rounded-3xl shadow-sm border border-border max-w-lg w-full">
        <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-7xl font-extrabold text-content tracking-tight">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-content">
          Hoppá! Kilyukadt a kerék...
        </h2>
        
        <p className="text-content-muted text-base">
          Úgy tűnik, letértél az útról. Az általad keresett oldal nem található, átnevezték, vagy talán sosem létezett.
        </p>
        
        <div className="pt-6">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-hover transition-colors shadow-md"
          >
            <Home className="w-5 h-5 mr-2" />
            Vissza a garázsba (Főoldal)
          </Link>
        </div>
      </div>
    </div>
  );
}