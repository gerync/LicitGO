import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle browser autofill which may populate inputs without triggering React onChange.
    const form = e.target;
    const identifierValue = form.elements['identifier']?.value || formData.identifier;
    const passwordValue = form.elements['password']?.value || formData.password;

    if (!identifierValue || !passwordValue) {
      return toast.error("Kérlek, tölts ki minden mezőt!");
    }

    setIsLoading(true);
    
    try {
      // Send explicit payload using values read from DOM (covers autofill cases)
      await login({ identifier: identifierValue, password: passwordValue });
      toast.success("Sikeres bejelentkezés!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Hiba a bejelentkezés során. Próbáld újra!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 sm:p-10 rounded-2xl shadow-lg border border-border">
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-content">
            Üdvözlünk újra!
          </h2>
          <p className="mt-3 text-sm text-content-muted">
            Jelentkezz be a fiókodba a folytatáshoz.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email mező */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-content mb-1">
                Email cím (vagy Felhasználónév)
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                autoComplete="username email"
                className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                placeholder="példa@email.hu"
              />
            </div>

            {/* Jelszó mező és elfelejtett jelszó link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-content">
                  Jelszó
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                  Elfelejtetted a jelszavad?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

          </div>

          {/* Bejelentkezés gomb */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-border text-center">
          <p className="text-sm text-content-muted">
            Még nincs fiókod?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Regisztrálj itt!
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}