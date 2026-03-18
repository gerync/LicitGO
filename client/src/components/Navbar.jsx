import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logó */}
          <Link to="/" className="flex items-center space-x-2">
            <Gavel className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Licit<span className="text-blue-600">GO</span>
            </span>
          </Link>

          {/* Asztali menü (Nagy képernyőn) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/auctions" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Aukciók
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Irányítópult
                </Link>
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-700 flex items-center font-medium">
                    <User className="w-4 h-4 mr-1 text-gray-500" /> {user.username}
                  </span>
                  <button 
                    onClick={logout}
                    className="flex items-center text-red-500 hover:text-red-700 font-medium transition"
                  >
                    <LogOut className="w-4 h-4 mr-1" /> Kijelentkezés
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Belépés
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  Regisztráció
                </Link>
              </div>
            )}
          </div>

          {/* Mobilos "Hamburger" menü gomb */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobilos legördülő menü */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-2 pb-4 shadow-lg">
          <Link to="/auctions" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium">
            Aukciók
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium">
                Irányítópult
              </Link>
              <div className="px-3 py-2 text-gray-500 font-medium flex items-center border-t border-gray-100 mt-2 pt-2">
                <User className="w-4 h-4 mr-2" /> {user.username}
              </div>
              <button 
                onClick={logout}
                className="w-full text-left block px-3 py-2 text-red-500 hover:bg-red-50 rounded-md font-medium"
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <div className="border-t border-gray-100 mt-2 pt-2 space-y-2">
              <Link to="/login" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium">
                Belépés
              </Link>
              <Link to="/register" className="block w-full px-3 py-2 bg-blue-600 text-white text-center rounded-md font-medium hover:bg-blue-700">
                Regisztráció
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}