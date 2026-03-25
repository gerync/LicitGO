import { useState } from 'react';
import { 
  User, Car, Gavel, History, Settings, LogOut, 
  ShieldCheck, ShieldAlert, Calendar, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // --- IDEIGLENES KAMU ADATOK (Mock Data) a backend /user/profile alapján ---
  const mockProfileData = {
    user: {
      username: 'LicitKing99',
      email: 'king@licitgo.hu',
      tfa_enabled: true,
      created_at: '2023-11-15T10:30:00Z'
    },
    cars: [
      { carid: 1, manufacturer: 'Porsche', model: '911 Carrera', modelyear: 2021, color: 'Fekete', mainImagepath: 'https://images.unsplash.com/photo-1503376762365-33dea15b4206?q=80&w=400&auto=format&fit=crop' },
      { carid: 2, manufacturer: 'BMW', model: 'M4 Competition', modelyear: 2023, color: 'Kék', mainImagepath: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=400&auto=format&fit=crop' }
    ],
    auctions: [
      { auctionid: 1, car: { manufacturer: 'Porsche', model: '911 Carrera' }, currentPrice: 54500, status: 'ongoing', endtime: new Date(Date.now() + 172800000).toISOString() }
    ],
    bids: [
      { bidid: 1, amount: 18500, created_at: new Date(Date.now() - 86400000).toISOString(), auction: { auctionid: 3, status: 'ongoing', car: { manufacturer: 'Audi', model: 'RS6 Avant' } } }
    ]
  };

  const [activeTab, setActiveTab] = useState('profile');
  const { user, cars, auctions, bids } = mockProfileData;

  const tabs = [
    { id: 'profile', label: 'Áttekintés', icon: User },
    { id: 'cars', label: 'Garázsom', icon: Car },
    { id: 'auctions', label: 'Aukcióim', icon: Gavel },
    { id: 'bids', label: 'Licitjeim', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Fejléc */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-content tracking-tight">Vezérlőpult</h1>
          <p className="text-content-muted mt-1">Kezeld a fiókodat, autóidat és licitjeidet egy helyen.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/addcar" className="bg-surface border border-border text-content hover:bg-background font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center">
            <Car className="w-4 h-4 mr-2" /> Új autó
          </Link>
          <Link to="/addauction" className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center">
            <Gavel className="w-4 h-4 mr-2" /> Új aukció
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigációs Menü (Tabs) */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm sticky top-24">
            
            {/* Felhasználó mini profil */}
            <div className="p-6 border-b border-border bg-background/50 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="font-bold text-content text-lg">{user.username}</h2>
              <p className="text-sm text-content-muted truncate">{user.email}</p>
            </div>

            {/* Menüpontok */}
            <nav className="flex flex-col p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-xl mb-1 transition-all font-medium ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-content-muted hover:bg-background hover:text-content'}`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.label}
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === tab.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
              
              <div className="my-2 border-t border-border"></div>
              
              <button className="flex items-center px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium">
                <LogOut className="w-5 h-5 mr-3" /> Kijelentkezés
              </button>
            </nav>
          </div>
        </div>

        {/* Aktív Tab Tartalma */}
        <div className="flex-grow">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-content mb-6 flex items-center border-b border-border pb-3">
                  <User className="w-6 h-6 mr-2 text-primary" /> Fiók adatai
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-content-muted mb-1">Felhasználónév</p>
                    <p className="font-bold text-lg text-content">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-content-muted mb-1">Email cím</p>
                    <p className="font-bold text-lg text-content">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-content-muted mb-1">Regisztráció dátuma</p>
                    <p className="font-bold text-lg text-content flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-content-muted" /> 
                      {new Date(user.created_at).toLocaleDateString('hu-HU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-content-muted mb-1">Biztonság (2FA)</p>
                    <div className="flex items-center">
                      {user.tfa_enabled ? (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                           <ShieldCheck className="w-4 h-4 mr-1" /> Bekapcsolva
                         </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                           <ShieldAlert className="w-4 h-4 mr-1" /> Kikapcsolva
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                  <Link to="/settings" className="bg-background border border-border hover:border-primary text-content font-medium py-2 px-4 rounded-lg transition-colors flex items-center shadow-sm">
                    <Settings className="w-4 h-4 mr-2" /> Beállítások módosítása
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Garázsom */}
          {activeTab === 'cars' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-content mb-4 flex items-center">
                <Car className="w-6 h-6 mr-2 text-primary" /> Saját autóim ({cars.length})
              </h3>
              
              {cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cars.map(car => (
                    <div key={car.carid} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="h-40 w-full overflow-hidden bg-background">
                        <img src={car.mainImagepath} alt="car" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex-grow">
                        <h4 className="font-bold text-lg text-content">{car.manufacturer} {car.model}</h4>
                        <p className="text-sm text-content-muted mt-1">{car.modelyear} • {car.color}</p>
                      </div>
                      <div className="p-4 border-t border-border bg-background/30 flex justify-between">
                         <button className="text-sm font-medium text-primary hover:text-primary-hover">Szerkesztés</button>
                         <button className="text-sm font-medium text-red-500 hover:text-red-700">Törlés</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface border border-border rounded-2xl">
                  <Car className="w-12 h-12 text-border mx-auto mb-3" />
                  <p className="text-content-muted">Még nem töltöttél fel autót.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Aukcióim */}
          {activeTab === 'auctions' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-content mb-4 flex items-center">
                <Gavel className="w-6 h-6 mr-2 text-primary" /> Indított aukcióim ({auctions.length})
              </h3>
              
              <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border">
                      <th className="p-4 font-semibold text-content-muted text-sm">Autó</th>
                      <th className="p-4 font-semibold text-content-muted text-sm">Jelenlegi ár</th>
                      <th className="p-4 font-semibold text-content-muted text-sm">Státusz</th>
                      <th className="p-4 font-semibold text-content-muted text-sm text-right">Művelet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctions.map(auc => (
                      <tr key={auc.auctionid} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="p-4 font-bold text-content">{auc.car.manufacturer} {auc.car.model}</td>
                        <td className="p-4 font-bold text-primary">{auc.currentPrice.toLocaleString()} $</td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                            Aktív
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/auctions/${auc.auctionid}`} className="text-sm font-medium text-primary hover:underline">Megtekintés</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Licitjeim */}
          {activeTab === 'bids' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-content mb-4 flex items-center">
                <History className="w-6 h-6 mr-2 text-primary" /> Leadott licitjeim ({bids.length})
              </h3>
              
              <div className="space-y-3">
                {bids.map(bid => (
                  <div key={bid.bidid} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-primary transition-colors">
                    <div>
                      <p className="text-sm text-content-muted mb-1">
                        {new Date(bid.created_at).toLocaleDateString('hu-HU')} • {new Date(bid.created_at).toLocaleTimeString('hu-HU', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <h4 className="font-bold text-content">
                        Licit: {bid.auction.car.manufacturer} {bid.auction.car.model}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-lg text-primary">{bid.amount.toLocaleString()} $</p>
                      <Link to={`/auctions/${bid.auction.auctionid}`} className="text-xs text-content-muted hover:text-primary mt-1 inline-block">Aukcióhoz ugrás →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}