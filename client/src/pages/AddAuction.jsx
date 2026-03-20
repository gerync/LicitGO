import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config';
import toast from 'react-hot-toast';
import { Car, DollarSign, Calendar, Gavel, Loader2, ArrowRight } from 'lucide-react';

export default function AddAuction() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // --- IDEIGLENES KAMU AUTÓK (Amíg a backend nem küldi a saját autóidat) ---
  const mockMyCars = [
    { id: 1, name: "Porsche 911 Carrera S (2021) - Fekete" },
    { id: 2, name: "BMW M4 Competition (2023) - Kék" },
    { id: 3, name: "Audi RS6 Avant (2018) - Szürke" }
  ];

  const [formData, setFormData] = useState({
    carid: '',
    startingBid: '',
    reservePrice: '',
    starttime: '',
    endtime: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.carid || !formData.startingBid || !formData.starttime || !formData.endtime) {
      toast.error("Kérjük, tölts ki minden kötelező mezőt!");
      return;
    }

    if (Number(formData.reservePrice) > 0 && Number(formData.reservePrice) < Number(formData.startingBid)) {
      toast.error("A minimálár nem lehet kisebb, mint a kezdőlicit!");
      return;
    }

    const start = new Date(formData.starttime);
    const end = new Date(formData.endtime);

    if (start >= end) {
      toast.error("Az aukció végének később kell lennie, mint a kezdetének!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        carid: Number(formData.carid),
        startingBid: Number(formData.startingBid),
        reservePrice: formData.reservePrice ? Number(formData.reservePrice) : null,
        starttime: start.toISOString(),
        endtime: end.toISOString()
      };

      const response = await api.post('/auction/addauction', payload);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba az aukció indításakor.");
      }

      toast.success("Aukció sikeresen elindítva!");
      navigate('/dashboard'); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="bg-background p-3 rounded-full border border-border">
            <Gavel className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-content">Aukció Indítása</h1>
        <p className="text-content-muted mt-2">Válaszd ki az autódat, és állítsd be a licitálás szabályait.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
        
        {/* Autó kiválasztása */}
        <div>
          <h2 className="text-lg font-bold text-content mb-4 flex items-center border-b border-border pb-2">
            <Car className="w-5 h-5 mr-2 text-primary" /> Jármű kiválasztása
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Melyik autódat bocsátod licitre?</label>
            <select 
              required 
              name="carid" 
              value={formData.carid} 
              onChange={handleChange} 
              className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary"
            >
              <option value="">Válassz a garázsodból...</option>
              {mockMyCars.map(car => (
                <option key={car.id} value={car.id}>{car.name}</option>
              ))}
            </select>
            <p className="text-xs text-content-muted mt-2">Csak a már feltöltött, de még nem aukciózott autóid jelennek meg itt.</p>
          </div>
        </div>

        {/*Pénzügyek */}
        <div>
          <h2 className="text-lg font-bold text-content mb-4 flex items-center border-b border-border pb-2">
            <DollarSign className="w-5 h-5 mr-2 text-primary" /> Pénzügyi beállítások
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Kezdőlicit ($)</label>
              <div className="relative">
                <input 
                  required 
                  name="startingBid" 
                  value={formData.startingBid} 
                  onChange={handleChange} 
                  type="number" 
                  min="1"
                  placeholder="pl. 10000" 
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimálár ($) - Opcionális</label>
              <div className="relative">
                <input 
                  name="reservePrice" 
                  value={formData.reservePrice} 
                  onChange={handleChange} 
                  type="number" 
                  min="0"
                  placeholder="Titkos eladási minimum" 
                  className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary" 
                />
              </div>
              <p className="text-xs text-content-muted mt-1">Ha a licit nem éri el ezt az árat, nem vagy köteles eladni.</p>
            </div>
          </div>
        </div>

        {/* Időzítés */}
        <div>
          <h2 className="text-lg font-bold text-content mb-4 flex items-center border-b border-border pb-2">
            <Calendar className="w-5 h-5 mr-2 text-primary" /> Időzítés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Kezdés időpontja</label>
              <input 
                required 
                name="starttime" 
                value={formData.starttime} 
                onChange={handleChange} 
                type="datetime-local" 
                className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Befejezés időpontja</label>
              <input 
                required 
                name="endtime" 
                value={formData.endtime} 
                onChange={handleChange} 
                type="datetime-local" 
                className="w-full bg-background border border-border rounded-lg p-3 text-content focus:ring-primary focus:border-primary" 
              />
            </div>
          </div>
        </div>

        {/* Gomb */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full flex justify-center items-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Gavel className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Feldolgozás...' : 'Aukció meghirdetése'}
          </button>
        </div>

      </form>
    </div>
  );
}