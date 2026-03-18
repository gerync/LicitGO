import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Loader2, Gavel, Check, X, Phone, Calendar, IdCard, Users, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [usertag, setUsertag] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [passwordconfirm, setPasswordconfirm] = useState('');
  const [pfp, setPfp] = useState(null); 

  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  //  Vizuális validáció a backend alapján 
  // usertag: 3-32 karakter, csak kisbetű, szám, alulvonás
  const isUsertagValid = usertag.length >= 3 && /^[a-z0-9_]+$/.test(usertag);
  const isPasswordStrong = 
    password.length >= 8 && 
    /[a-z]/.test(password) && 
    /[A-Z]/.test(password) && 
    /\d/.test(password) && 
    /[^A-Za-z0-9]/.test(password);
  const doPasswordsMatch = password !== '' && password === passwordconfirm;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPfp(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  ellenőrzés
    if (!usertag || !fullname || !email || !mobile || !gender || !birthdate || !password || !passwordconfirm) {
      toast.error("Kérjük, tölts ki minden kötelező mezőt!");
      return;
    }

    if (!isUsertagValid) {
      toast.error("A felhasználónév csak kisbetűket, számokat és alulvonást tartalmazhat (min. 3 karakter)!");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("A jelszó nem elég erős!");
      return;
    }

    if (!doPasswordsMatch) {
      toast.error("A megadott jelszavak nem egyeznek!");
      return;
    }

    setIsLoading(true);
    try {
      //  fájlt miatt FormData :)
      const formData = new FormData();
      formData.append('usertag', usertag);
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('mobile', mobile);
      formData.append('gender', gender);
      formData.append('birthdate', birthdate);
      formData.append('password', password);
      formData.append('passwordconfirm', passwordconfirm);
      if (pfp) {
        formData.append('pfp', pfp);
      }

      await register(formData);
      
      toast.success("Sikeres regisztráció! Kérjük, erősítsd meg az email címedet.");
      navigate('/login'); 
    } catch (error) {
      console.error("Hiba a regisztrációkor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-surface rounded-2xl shadow-xl p-8 border border-border">
        
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

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          
          {/* Kétoszlopos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/*  BAL OSZLOP*/}
            <div className="space-y-5">
              {/* Usertag */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Felhasználónév</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="text"
                    value={usertag}
                    onChange={(e) => setUsertag(e.target.value.toLowerCase())} 
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="kukacka"
                  />
                </div>
              </div>

              {/* Teljes név */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Teljes név</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCard className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Kukac Kálmán"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Email cím</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="példa@email.com"
                  />
                </div>
              </div>

              {/* Mobil */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Telefonszám</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="+36301234567"
                  />
                </div>
              </div>
            </div>

            {/*  JOBB OSZLOP  */}
            <div className="space-y-5">
              {/* Születési dátum */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Születési dátum</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>

              {/* Nem- Dropdown */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Nem</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="pl-10 block w-full bg-background border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="" disabled>Válassz...</option>
                    <option value="Male">Férfi</option>
                    <option value="Female">Nő</option>
                  </select>
                </div>
              </div>

              {/* Jelszó */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Jelszó</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Jelszó újra */}
              <div>
                <label className="block text-sm font-medium text-content mb-1">Jelszó megerősítése</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-content-muted opacity-70" />
                  </div>
                  <input
                    type="password"
                    value={passwordconfirm}
                    onChange={(e) => setPasswordconfirm(e.target.value)}
                    className="pl-10 block w-full bg-transparent border border-border rounded-lg py-2.5 text-content focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profilkép feltöltés  */}
          <div>
            <label className="block text-sm font-medium text-content mb-1">Profilkép (Opcionális)</label>
            <div className="flex items-center space-x-4 border border-border rounded-lg p-2 bg-transparent">
              <div className="bg-background p-2 rounded border border-border">
                <ImageIcon className="h-6 w-6 text-content-muted" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-content-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
              />
            </div>
          </div>

          {/*  Vizuális  validátor */}
          <div className="bg-background rounded-lg p-4 space-y-2 border border-border grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className={`flex items-center text-sm transition-colors ${isUsertagValid ? 'text-green-500 font-medium' : 'text-content-muted'}`}>
              {isUsertagValid ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2 opacity-50" />}
              Érvényes felhasználónév formátum
            </div>
            <div className={`flex items-center text-sm transition-colors ${isPasswordStrong ? 'text-green-500 font-medium' : 'text-content-muted'}`}>
              {isPasswordStrong ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2 opacity-50" />}
              Erős jelszó (Kis/nagybetű, szám, spec. kar)
            </div>
            <div className={`flex items-center text-sm transition-colors ${doPasswordsMatch ? 'text-green-500 font-medium' : 'text-content-muted'}`}>
              {doPasswordsMatch ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2 opacity-50" />}
              A két jelszó megegyezik
            </div>
          </div>

          {/* Beküldés Gomb */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Regisztráció...
              </>
            ) : (
              <>
                <UserPlus className="-ml-1 mr-2 h-5 w-5 text-white" />
                Fiók létrehozása
              </>
            )}
          </button>
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