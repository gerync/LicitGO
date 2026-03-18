import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Loader2, Gavel, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Valós idejű validációs szabályok a UI-hoz
  const isPasswordLongEnough = password.length >= 8;
  const doPasswordsMatch = password !== '' && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Kérjük, tölts ki minden mezőt!");
      return;
    }

    if (!isPasswordLongEnough) {
      toast.error("A jelszónak legalább 8 karakternek kell lennie!");
      return;
    }

    if (!doPasswordsMatch) {
      toast.error("A megadott jelszavak nem egyeznek!");
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      navigate('/login'); 
      toast.success("Sikeres regisztráció! Kérjük, jelentkezz be.");
    } catch (error) {
      console.error("Hiba a regisztrációkor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Itt már a te saját 'surface' színedet használjuk a kártyához! */}
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 border border-border">
        
        {/* Fejléc */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-background p-3 rounded-full border border-border">
              <Gavel className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-content tracking-tight">
            Hozd létre a fiókod
          </h2>
          <p className="mt-2 text-sm text-content-muted">
            Csatlakozz a LicitGO közösségéhez és licitálj!
          </p>
        </div>

        {/* Űrlap */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          
          {/* Felhasználónév */}
          <div>
            <label className="block text-sm font-medium text-content mb-1" htmlFor="username">
              Felhasználónév
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-content-muted opacity-70" />
              </div>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="LicitKirály99"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-content mb-1" htmlFor="email">
              Email cím
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-content-muted opacity-70" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="pelda@email.com"
              />
            </div>
          </div>

          {/* Jelszó */}
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

          {/* Jelszó újra */}
          <div>
            <label className="block text-sm font-medium text-content mb-1" htmlFor="confirmPassword">
              Jelszó újra
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-content-muted opacity-70" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* --- VIZUÁLIS VALIDÁCIÓ --- */}
          <div className="bg-background rounded-lg p-3 space-y-2 border border-border">

          </div>

          {/* Beküldés Gomb */}

        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-content-muted">Már van fiókod? </span>
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover hover:underline transition-all">
            Lépj be itt
          </Link>
        </div>
      </div>
    </div>
  );
}