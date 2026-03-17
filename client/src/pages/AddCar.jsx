import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AddCar() {
  const navigate = useNavigate()

  const [manufacturer, setManufacturer] = useState("")
  const [model, setModel] = useState("")
  const [color, setColor] = useState("")
  const [odometerKM, setOdometerKM] = useState("")
  const [modelyear, setModelyear] = useState("")
  const [efficiency, setEfficiency] = useState("")
  const [efficiencyunit, setEfficiencyunit] = useState("HP")
  const [enginecapacity, setEnginecapacity] = useState("")
  const [fueltype, setFueltype] = useState("gasoline")
  const [transmission, setTransmission] = useState("manual")
  const [bodytype, setBodytype] = useState("sedan")
  const [doors, setDoors] = useState("")
  const [seats, setSeats] = useState("")
  const [vin, setVin] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddCar = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("http://localhost:3000/auction/addcar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          manufacturer,
          model,
          color,
          odometerKM: Number(odometerKM),
          modelyear: Number(modelyear),
          efficiency: Number(efficiency),
          efficiencyunit,
          enginecapacity: Number(enginecapacity),
          fueltype,
          transmission,
          bodytype,
          doors: Number(doors),
          seats: Number(seats),
          vin
        })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSuccess(data.message || "Car sikeresen létrehozva!")
        navigate("/dashboard")
      } else {
        setError(data.error || data.message || "Car létrehozása sikertelen!")
      }
    } catch {
      setError("Szerver hiba")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Add Car</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleAddCar}>
          <input
            type="text"
            placeholder="Manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Odometer KM"
            value={odometerKM}
            onChange={(e) => setOdometerKM(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Model Year"
            value={modelyear}
            onChange={(e) => setModelyear(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Efficiency"
            value={efficiency}
            onChange={(e) => setEfficiency(e.target.value)}
            required
          />

          <select
            value={efficiencyunit}
            onChange={(e) => setEfficiencyunit(e.target.value)}
            required
          >
            <option value="HP">HP</option>
            <option value="kW">kW</option>
          </select>

          <input
            type="number"
            placeholder="Engine Capacity (cc)"
            value={enginecapacity}
            onChange={(e) => setEnginecapacity(e.target.value)}
            required
          />

          <select
            value={fueltype}
            onChange={(e) => setFueltype(e.target.value)}
            required
          >
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
            <option value="other">Other</option>
          </select>

          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            required
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="semi-automatic">Semi-Automatic</option>
            <option value="CVT">CVT</option>
            <option value="dual-clutch">Dual-Clutch</option>
            <option value="other">Other</option>
          </select>

          <select
            value={bodytype}
            onChange={(e) => setBodytype(e.target.value)}
            required
          >
            <option value="sedan">Sedan</option>
            <option value="hatchback">Hatchback</option>
            <option value="SUV">SUV</option>
            <option value="coupe">Coupe</option>
            <option value="convertible">Convertible</option>
            <option value="wagon">Wagon</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
            <option value="other">Other</option>
          </select>

          <input
            type="number"
            placeholder="Doors"
            value={doors}
            onChange={(e) => setDoors(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Létrehozás..." : "Add Car"}
          </button>
        </form>
      </div>
    </div>
  )
}