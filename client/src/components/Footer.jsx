import { Link } from 'react-router-dom';
import { Gavel } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Gavel className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Licit<span className="text-blue-600">GO</span>
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LicitGO. Minden jog fenntartva.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition text-sm">
              Főoldal
            </Link>
            <Link to="/auctions" className="text-gray-500 hover:text-blue-600 transition text-sm">
              Aukciók
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}