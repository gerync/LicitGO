import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config';
import toast from 'react-hot-toast';
import { Car, Wrench, LayoutGrid, Image as ImageIcon, ArrowRight, ArrowLeft, Check, Upload, X, Loader2 } from 'lucide-react';

export default function AddCar() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    manufacturer: '', model: '', modelyear: '', color: '', vin: '', description: '',
    odometerKM: '', enginecapacity: '', fueltype: '', transmission: '', efficiency: '', efficiencyunit: 'kW', maxspeedKMH: '', zeroToHundredSec: '', emissionsGKM: '',
    bodytype: '', doors: '', seats: '', weightKG: '', features: '', factoryExtras: ''
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Legalább egy képet fel kell töltened az autóról!");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      images.forEach((image) => {
        submitData.append('images', image);
      });

      const response = await api.post('/auction/addcar', submitData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba történt az autó feltöltésekor.");
      }

      toast.success("Autó sikeresen feltöltve!");
      navigate('/dashboard'); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-content">Új autó feltöltése</h1>
        <p className="text-content-muted mt-2">Add meg a jármű adatait a licitre bocsátáshoz.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-border z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-300" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
          
          {[
            { step: 1, icon: Car, label: "Alapadatok" },
            { step: 2, icon: Wrench, label: "Motor" },
            { step: 3, icon: LayoutGrid, label: "Méretek" },
            { step: 4, icon: ImageIcon, label: "Képek" }
          ].map((item) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= item.step ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-content-muted'}`}>
                {currentStep > item.step ? <Check className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-2 font-medium hidden sm:block ${currentStep >= item.step ? 'text-primary' : 'text-content-muted'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Űrlap */}
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Alapadatok */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-content mb-4 border-b border-border pb-2">1. Alapadatok</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="block text-sm font-medium mb-1">Gyártó</label><input required name="manufacturer" value={formData.manufacturer} onChange={handleChange} type="text" placeholder="pl. BMW" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Modell</label><input required name="model" value={formData.model} onChange={handleChange} type="text" placeholder="pl. M4 Competition" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Évjárat</label><input required name="modelyear" value={formData.modelyear} onChange={handleChange} type="number" placeholder="2023" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Szín</label><input required name="color" value={formData.color} onChange={handleChange} type="text" placeholder="pl. Fekete" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Alvázszám (VIN)</label><input required name="vin" value={formData.vin} onChange={handleChange} type="text" placeholder="17 karakteres alvázszám" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Leírás</label><textarea required name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Autó általános állapota, sérülések stb..." className="w-full bg-background border border-border rounded-lg p-2.5 text-content"></textarea></div>
            </div>
          </div>
        )}

        {/* Motor és teljesítmény */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-content mb-4 border-b border-border pb-2">2. Motor és Teljesítmény</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="block text-sm font-medium mb-1">Kilométeróra állása (km)</label><input required name="odometerKM" value={formData.odometerKM} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Hengerűrtartalom (cm3)</label><input name="enginecapacity" value={formData.enginecapacity} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Üzemanyag</label>
                <select required name="fueltype" value={formData.fueltype} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-2.5 text-content">
                  <option value="">Válassz...</option>
                  <option value="gasoline">Benzin</option>
                  <option value="diesel">Dízel</option>
                  <option value="electric">Elektromos</option>
                  <option value="hybrid">Hibrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Váltó</label>
                <select required name="transmission" value={formData.transmission} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-2.5 text-content">
                  <option value="">Válassz...</option>
                  <option value="manual">Manuális</option>
                  <option value="automatic">Automata</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-grow"><label className="block text-sm font-medium mb-1">Teljesítmény</label><input required name="efficiency" value={formData.efficiency} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
                <div className="w-24"><label className="block text-sm font-medium mb-1">Mérték</label><select name="efficiencyunit" value={formData.efficiencyunit} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-2.5 text-content"><option value="kW">kW</option><option value="HP">Lóerő</option></select></div>
              </div>

              <div><label className="block text-sm font-medium mb-1">Végsebesség (km/h)</label><input name="maxspeedKMH" value={formData.maxspeedKMH} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">0-100 km/h (mp)</label><input name="zeroToHundredSec" value={formData.zeroToHundredSec} onChange={handleChange} type="number" step="0.1" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Károsanyag kibocsátás (g/km)</label><input name="emissionsGKM" value={formData.emissionsGKM} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
            </div>
          </div>
        )}

        {/*Méretek és extrák */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-content mb-4 border-b border-border pb-2">3. Méretek és Extrák</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1">Kivitel</label>
                <select required name="bodytype" value={formData.bodytype} onChange={handleChange} className="w-full bg-background border border-border rounded-lg p-2.5 text-content">
                  <option value="">Válassz...</option>
                  <option value="sedan">Szedán</option>
                  <option value="suv">SUV / Terepjáró</option>
                  <option value="coupe">Kupé</option>
                  <option value="hatchback">Ferdehátú</option>
                  <option value="station wagon">Kombi</option>
                  <option value="convertible">Kabrió</option>
                  <option value="van">Kisbusz</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Ajtók száma</label><input required name="doors" value={formData.doors} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Ülések száma</label><input required name="seats" value={formData.seats} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div><label className="block text-sm font-medium mb-1">Súly (kg)</label><input name="weightKG" value={formData.weightKG} onChange={handleChange} type="number" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Felszereltség (vesszővel elválasztva)</label><input name="features" value={formData.features} onChange={handleChange} type="text" placeholder="pl. Klíma, Bőrkárpit, Tolatókamera" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Gyári extrák</label><input name="factoryExtras" value={formData.factoryExtras} onChange={handleChange} type="text" placeholder="pl. M-Sport csomag" className="w-full bg-background border border-border rounded-lg p-2.5 text-content" /></div>
            </div>
          </div>
        )}

        {/* Képek */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-content mb-4 border-b border-border pb-2">4. Képek feltöltése</h2>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-background hover:bg-border/20 transition-colors cursor-pointer relative">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-content font-medium">Kattints ide vagy húzd be a képeket</p>
              <p className="text-sm text-content-muted mt-1">PNG, JPG, JPEG (Max 5MB / kép)</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-border h-24">
                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigációs gombok   Következő / Vissza / Beküldés */}
        <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
          {currentStep > 1 ? (
            <button type="button" onClick={prevStep} className="flex items-center text-content-muted hover:text-content font-medium px-4 py-2 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Vissza
            </button>
          ) : <div></div>}

          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="flex items-center bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
              Következő <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="flex items-center bg-green-600 text-white font-bold px-8 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
              {isLoading ? 'Feltöltés...' : 'Autó feltöltése'}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}