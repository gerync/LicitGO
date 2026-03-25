import { Gavel, Github, X, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Gavel className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-content">
              Licit<span className="text-primary">GO</span>
            </span>
          </div>

          <div className="flex space-x-6 text-sm font-medium">
            <Link to="#" className="text-content-muted hover:text-primary transition-colors">Rólunk</Link>
            <Link to="#" className="text-content-muted hover:text-primary transition-colors">Feltételek</Link>
            <Link to="#" className="text-content-muted hover:text-primary transition-colors">Adatvédelmi irányelvek</Link>
            <Link to="#" className="text-content-muted hover:text-primary transition-colors">GYIK</Link>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-content-muted text-sm text-center md:text-left">
            © {new Date().getFullYear()} LicitGO. Minden jog fenntartva!!!
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-content-muted hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-content-muted hover:text-primary transition-colors">
              <X className="w-5 h-5" />
            </a>
            <a href="#" className="text-content-muted hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}