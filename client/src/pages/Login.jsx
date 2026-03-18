import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, LogIn, Loader2, Gavel } from 'lucide-react'; 
import toast from 'react-hot-toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogin, setKeepLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error("Kérjük, tölts ki minden mezőt!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier, password, keepLogin);
      
      if (result && !result.requires2FA) {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error("Hiba a bejelentkezéskor:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 border border-border">
        
        {/* Fejléc */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-background p-3 rounded-full border border-border">
              <Gavel className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-content tracking-tight">
            Üdvözlünk újra!
          </h2>
          <p className="mt-2 text-sm text-content-muted">
            Jelentkezz be emaillel, felhasználónévvel vagy mobilszámmal.
          </p>
        </div>

        {/* Űrlap */}
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          
          {/* Azonosító mező */}
          <div>
            <label className="block text-sm font-medium text-content mb-1" htmlFor="identifier">
              Azonosító (Email / Név / Mobil)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-content-muted opacity-70" />
              </div>
              <input
                id="identifier"
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="email/felhasználónév/mobilszám"
              />
            </div>
          </div>

          {/* Jelszó mező */}
          <div>
            <label className="block text-sm font-medium text-content mb-1" htmlFor="password">
              Jelszó
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-content-muted opacity-70" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          { /* Emlékezz rám Checkbox */ }
          <div className="flex items-center">
            <input
              id="keepLogin"
              type="checkbox"
              checked={keepLogin}
              onChange={(e) => setKeepLogin(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background"
            />
            <label htmlFor="keepLogin" className="ml-2 block text-sm text-content-muted cursor-pointer hover:text-content transition-colors">
              Emlékezz rám (30 napig)
            </label>
          </div>

          {/* Beküldés Gomb */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Bejelentkezés folyamatban...
              </>
            ) : (
              <>
                <LogIn className="-ml-1 mr-2 h-5 w-5 text-white" />
                Bejelentkezés
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-content-muted">Még nincs fiókod? </span>
          <Link to="/register" className="font-medium text-primary hover:text-primary-hover hover:underline transition-all">
            Regisztrálj most
          </Link>
        </div>
      </div>
    </div>
  );
}