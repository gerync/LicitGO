import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, User, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logó */}
          <Link to="/" className="flex items-center space-x-2">
            <Gavel className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-content">
              Licit<span className="text-primary">GO</span>
            </span>
          </Link>

          <Link 
            to="/AddCar" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg animate-pulse border-2 border-red-400"
          >
            !Autó hozzáadása!
          </Link>

          <Link 
            to="/AddAuction" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg animate-pulse border-2 border-red-400"
          >
            !Aukció indítása!
          </Link>

          <Link 
            to="/dashboard" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg animate-pulse border-2 border-red-400"
          >
            !Dashboard teszt!
          </Link>
          
          {/* Asztali menü */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Téma kapcsoló */}
            <div className="flex items-center mr-2 border-r border-border pr-6">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-lg text-content-muted hover:bg-background hover:text-primary transition-colors"
                title="Téma váltása"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <Link to="/auctions" className="text-content-muted hover:text-primary font-medium transition">
              Aukciók
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-content-muted hover:text-primary font-medium transition">
                  Irányítópult
                </Link>
                <div className="flex items-center space-x-4 pl-4 border-l border-border">
                  <span className="text-sm text-content flex items-center font-medium">
                    <User className="w-4 h-4 mr-1 text-content-muted" /> {user.username}
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
                <Link to="/login" className="text-content-muted hover:text-primary font-medium transition">
                  Belépés
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition shadow-sm"
                >
                  Regisztráció
                </Link>
              </div>
              
            )}
          </div>

          {/* Mobilos menü gomb */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-content-muted hover:text-content">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobilos legördülő */}
      {isOpen && (
        <div className="md:hidden bg-surface border-t border-border px-4 pt-2 pb-4 shadow-lg">
          
          {/* Téma kapcsoló */}
          <div className="flex items-center justify-center py-3 mb-2 border-b border-border">
            <button 
              onClick={toggleTheme} 
              className="flex items-center p-2 rounded-lg text-content-muted hover:bg-background hover:text-primary transition-colors font-medium"
            >
              {isDarkMode ? <><Sun className="w-5 h-5 mr-2" /> Világos mód</> : <><Moon className="w-5 h-5 mr-2" /> Sötét mód</>}
            </button>
          </div>
          <Link to="/auctions" className="block px-3 py-2 text-content-muted hover:bg-background rounded-md font-medium">
            Aukciók
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-content-muted hover:bg-background rounded-md font-medium">
                Irányítópult
              </Link>
              <div className="px-3 py-2 text-content-muted font-medium flex items-center border-t border-border mt-2 pt-2">
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
            <div className="border-t border-border mt-2 pt-2 space-y-2">
              <Link to="/login" className="block px-3 py-2 text-content-muted hover:bg-background rounded-md font-medium">
                Belépés
              </Link>
              <Link to="/register" className="block w-full px-3 py-2 bg-primary text-white text-center rounded-md font-medium hover:bg-primary-hover">
                Regisztráció
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}