import { createContext, useMemo, useState } from 'react'
import users from '../data/users.json'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const login = (email, password) => {
    const u = users.find((x) => x.email === email && x.password === password)
    if (u) setUser({ email: u.email, projects: u.projects })
    return !!u
  }
  const logout = () => setUser(null)
  const value = useMemo(() => ({ user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
