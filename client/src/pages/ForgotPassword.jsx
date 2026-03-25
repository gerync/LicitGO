import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Kérjük, add meg az email címedet!");

    setIsLoading(true);
    
    try {      
      setTimeout(() => {
        setIsSent(true);
        toast.success("Visszaállító link elküldve!");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Hiba történt. Kérlek, próbáld újra.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 sm:p-10 rounded-2xl shadow-lg border border-border">
        
        {!isSent ? (
          <>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-extrabold text-content">
                Elfelejtett jelszó
              </h2>
              <p className="mt-3 text-sm text-content-muted">
                Add meg a regisztrációhoz használt email címedet, és küldünk egy linket a jelszavad visszaállításához.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-content mb-1">
                  Email cím
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                  placeholder="pelda@email.hu"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isLoading ? 'Küldés folyamatban...' : 'Visszaállító link küldése'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <MailCheck className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-content mb-2">Ellenőrizd az email fiókodat!</h2>
            <p className="text-content-muted mb-8">
              Elküldtük a jelszó-visszaállító linket a(z) <span className="font-semibold text-content">{email}</span> címre. Kattints a levélben található linkre az új jelszó megadásához.
            </p>
            <button 
              onClick={() => { setIsSent(false); setEmail(''); }}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Nem kaptad meg? Próbáld újra.
            </button>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-border text-center">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-content-muted hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Vissza a bejelentkezéshez
          </Link>
        </div>

      </div>
    </div>
  );
}