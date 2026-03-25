import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Mail, Lock, Shield, ShieldCheck, ShieldAlert, 
  Save, Loader2, ArrowLeft 
} from 'lucide-react';
import { api } from '../api/config';

export default function Settings() {
  const [isLoading, setIsLoading] = useState({
    email: false,
    password: false,
    tfa: false
  });

  const [emailData, setEmailData] = useState({ newEmail: '' });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isTfaEnabled, setIsTfaEnabled] = useState(true);


  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!emailData.newEmail) return toast.error("Kérjük, add meg az új email címet!");

    setIsLoading(prev => ({ ...prev, email: true }));
    try {      
      setTimeout(() => {
        toast.success("Email cím sikeresen módosítva!");
        setEmailData({ newEmail: '' });
        setIsLoading(prev => ({ ...prev, email: false }));
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Hiba az email módosításakor.");
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Az új jelszavak nem egyeznek!");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Az új jelszónak legalább 6 karakternek kell lennie!");
    }

    setIsLoading(prev => ({ ...prev, password: true }));
    try {      
      setTimeout(() => {
        toast.success("Jelszó sikeresen megváltoztatva!");
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsLoading(prev => ({ ...prev, password: false }));
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Hiba a jelszó módosításakor.");
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const toggleTfa = async () => {
    setIsLoading(prev => ({ ...prev, tfa: true }));
    try {
      setTimeout(() => {
        setIsTfaEnabled(!isTfaEnabled);
        toast.success(isTfaEnabled ? "2FA sikeresen kikapcsolva!" : "2FA sikeresen bekapcsolva!");
        setIsLoading(prev => ({ ...prev, tfa: false }));
      }, 1000);
    } catch (error) {
      toast.error("Hiba a 2FA beállításakor.");
      setIsLoading(prev => ({ ...prev, tfa: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <Link to="/dashboard" className="inline-flex items-center text-content-muted hover:text-primary transition-colors font-medium mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Vissza a Vezérlőpultra
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-content tracking-tight">Beállítások</h1>
        <p className="text-content-muted mt-2">Kezeld a fiókod biztonságát és személyes adatait.</p>
      </div>

      <div className="space-y-8">
        
        {/* Email módosítása */}
        <section className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-background/50 flex items-center">
            <Mail className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-bold text-content">Email cím módosítása</h2>
          </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={handleEmailChange} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-content mb-1">Új email cím</label>
                <input 
                  type="email" 
                  required
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                  placeholder="pelda@email.hu" 
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading.email}
                className="flex items-center justify-center bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70"
              >
                {isLoading.email ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Mentés
              </button>
            </form>
          </div>
        </section>

        {/* Jelszó módosítása */}
        <section className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-background/50 flex items-center">
            <Lock className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-bold text-content">Jelszó megváltoztatása</h2>
          </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
              <div>
                <label className="block text-sm font-medium text-content mb-1">Jelenlegi jelszó</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-content mb-1">Új jelszó</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-content mb-1">Új jelszó megerősítése</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading.password}
                className="flex items-center justify-center bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-70"
              >
                {isLoading.password ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Jelszó frissítése
              </button>
            </form>
          </div>
        </section>

        {/* 2FA (Kétlépcsős azonosítás) */}
        <section className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-background/50 flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-xl font-bold text-content">Kétlépcsős azonosítás (2FA)</h2>
            </div>
            {isTfaEnabled ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                <ShieldCheck className="w-4 h-4 mr-1" /> Aktív
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                <ShieldAlert className="w-4 h-4 mr-1" /> Inaktív
              </span>
            )}
          </div>
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-content mb-2 font-medium">Extra biztonsági réteg a fiókod számára.</p>
              <p className="text-content-muted text-sm">
                A bekapcsolás után a bejelentkezéskor egy egyszer használatos biztonsági kódot is meg kell adnod, amit egy hitelesítő alkalmazás (pl. Google Authenticator) generál.
              </p>
            </div>
            
            <button 
              onClick={toggleTfa}
              disabled={isLoading.tfa}
              className={`flex-shrink-0 flex items-center justify-center font-bold py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-70 ${
                isTfaEnabled 
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading.tfa && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isTfaEnabled ? '2FA Kikapcsolása' : '2FA Bekapcsolása'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}