import { Link } from "react-router-dom";
import { Car, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero szekció */}
      <div className="relative bg-surface border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-content tracking-tight mb-6">
            A prémium <span className="text-primary">autóaukciók</span> otthona
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-content-muted mb-10">
            Licitálj ellenőrzött járművekre valós időben, vagy add el a sajátodat a legjobb áron a LicitGO platformján.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auctions" className="px-8 py-3 rounded-lg font-bold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center shadow-lg">
              Aukciók megtekintése <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/register" className="px-8 py-3 rounded-lg font-bold text-content bg-background border border-border hover:border-primary transition-colors flex items-center justify-center">
              Regisztráció
            </Link>
          </div>
        </div>
      </div>

      {/* Funkciók */}
      <div className="py-20 bg-background flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* 1. Kártya */}
            <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-content mb-3">Kiváló kínálat</h3>
              <p className="text-content-muted">Alaposan átvizsgált gépjárművek, hogy neked csak a választással kelljen foglalkoznod.</p>
            </div>

            {/* 2. Kártya */}
            <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-content mb-3">Valós idejű licit</h3>
              <p className="text-content-muted">Éld át az árverések izgalmát élőben! Kövesd a liciteket másodpercre pontosan, bárhonnan.</p>
            </div>

            {/* 3. Kártya */}
            <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-content mb-3">Biztonságos eladás</h3>
              <p className="text-content-muted">Garantált kifizetés és egyszerűsített adásvétel. Nálunk az autód a legjobb kezekben van.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}