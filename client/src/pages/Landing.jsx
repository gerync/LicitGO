import { Link } from "react-router-dom"
import "../styles/Auth.css"

export default function Landing() {
  return (
    <div className="landing">

      <div className="landing-hero">
        <h1>LicitGo</h1>
        <p>Modern autó aukciós platform</p>

        <div className="landing-buttons">
          <Link to="/auctions" className="landing-btn">
            Aukciók böngészése
          </Link>

          <Link to="/register" className="landing-btn-outline">
            Regisztráció
          </Link>
        </div>
      </div>

      <div className="landing-features">

        <div className="feature-card">
          <h3>Élő aukciók</h3>
          <p>Böngéssz a jelenleg elérhető autó aukciók között.</p>
        </div>

        <div className="feature-card">
          <h3>Egyszerű licitálás</h3>
          <p>Tegyél licitet gyorsan és kövesd az aukciók alakulását.</p>
        </div>

        <div className="feature-card">
          <h3>Add el az autódat</h3>
          <p>Hozz létre aukciót és add el autódat a legmagasabb ajánlatért.</p>
        </div>

      </div>

    </div>
  )
}