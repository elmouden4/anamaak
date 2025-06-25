"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  nom: string
  role: "citoyen" | "admin"
  points: number
  dateInscription: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, nom: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Utilisateurs simulés
const USERS_MOCK: (User & { password: string })[] = [
  {
    id: "1",
    email: "citoyen@marrakech.ma",
    password: "123456",
    nom: "Ahmed Benali",
    role: "citoyen",
    points: 150,
    dateInscription: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "admin@marrakech.ma",
    password: "admin123",
    nom: "Fatima El Mansouri",
    role: "admin",
    points: 0,
    dateInscription: new Date("2023-12-01"),
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem("anamak_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulation d'une requête API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = USERS_MOCK.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("anamak_user", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const signup = async (email: string, password: string, nom: string): Promise<boolean> => {
    // Simulation d'une requête API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Vérifier si l'email existe déjà
    const existingUser = USERS_MOCK.find((u) => u.email === email)
    if (existingUser) {
      return false
    }

    // Créer un nouvel utilisateur
    const newUser: User = {
      id: Date.now().toString(),
      email,
      nom,
      role: "citoyen",
      points: 0,
      dateInscription: new Date(),
    }

    // Ajouter à la liste simulée
    USERS_MOCK.push({ ...newUser, password })

    setUser(newUser)
    localStorage.setItem("anamak_user", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("anamak_user")
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
