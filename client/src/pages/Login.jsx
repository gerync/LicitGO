import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2, Gavel } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Kérjük, tölts ki minden mezőt!");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error("Hiba a bejelentkezéskor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Fejléc */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <Gavel className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Üdvözlünk újra!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Jelentkezz be a licitáláshoz és az autók kezeléséhez.
          </p>
        </div>

        {/* Űrlap */}
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          
          {/* Email mező */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email cím
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="pelda@email.com"
              />
            </div>
          </div>

          {/* Jelszó mező */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Jelszó
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Beküldés Gomb */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
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

        {/* Link a regisztrációhoz */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Még nincs fiókod? </span>
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
            Regisztrálj most
          </Link>
        </div>
      </div>
    </div>
  );
}