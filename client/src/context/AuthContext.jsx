import { createContext, useContext, useEffect, useState } from "react"
import { getCookie } from "../utils/cookies"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const syncFromCookies = () => {
    const usertag = getCookie("usertag")
    if (usertag) setUser({ usertag })
    else setUser(null)
  }

  useEffect(() => {
    syncFromCookies()
    setLoading(false)
  }, [])
const checkAuth = async () => {
  const usertag = getCookie("usertag")
  if (!usertag) {
    setUser(null)
    return
  }
const checkAuth = async () => {
  const usertag = getCookie("usertag")
  if (!usertag) {
    setUser(null)
    return
  }

  try {
    const res = await fetch("http://localhost:3000/user/settings", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // invalid, csak auth checkre
    })

    if (res.status === 401) {
      setUser(null)
    } else {
      setUser({ usertag })
    }
  } catch {
    setUser(null)
  }
}
}
  const logout = async () => {
    await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include"
    })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, syncFromCookies }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}