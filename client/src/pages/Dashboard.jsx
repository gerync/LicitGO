import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <>

      <div style={{ padding: 60 }}>
        <h1>Üdv {user?.usertag}</h1>
        <p>Itt lesznek a licitek.</p>
      </div>
    </>
  )
}