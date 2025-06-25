"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Signalement {
  id: string
  code: string
  type: string
  description: string
  localisation: string
  quartier: string
  photo?: string
  statut: "Soumise" | "En traitement" | "Résolu"
  dateCreation: Date
  points: number
}

interface SignalementContextType {
  signalements: Signalement[]
  ajouterSignalement: (signalement: Omit<Signalement, "id" | "code" | "dateCreation" | "statut" | "points">) => string
  modifierStatut: (id: string, statut: Signalement["statut"]) => void
  obtenirSignalementParCode: (code: string) => Signalement | undefined
  filtrerSignalements: (type?: string, quartier?: string) => Signalement[]
}

const SignalementContext = createContext<SignalementContextType | undefined>(undefined)

export function SignalementProvider({ children }: { children: React.ReactNode }) {
  const [signalements, setSignalements] = useState<Signalement[]>([])

  // Données d'exemple au chargement
  useEffect(() => {
    const signalementsExemple: Signalement[] = [
      {
        id: "1",
        code: "SIG-2024-0001",
        type: "Trou dans la chaussée",
        description: "Grand trou dangereux sur la route principale",
        localisation: "Avenue Mohammed V",
        quartier: "Gueliz",
        statut: "En traitement",
        dateCreation: new Date("2024-01-15"),
        points: 10,
      },
      {
        id: "2",
        code: "SIG-2024-0002",
        type: "Éclairage défectueux",
        description: "Lampadaire cassé depuis une semaine",
        localisation: "Rue de la Liberté",
        quartier: "Medina",
        statut: "Soumise",
        dateCreation: new Date("2024-01-16"),
        points: 5,
      },
    ]
    setSignalements(signalementsExemple)
  }, [])

  const genererCode = (): string => {
    const annee = new Date().getFullYear()
    const numero = (signalements.length + 1).toString().padStart(4, "0")
    return `SIG-${annee}-${numero}`
  }

  const ajouterSignalement = (
    nouveauSignalement: Omit<Signalement, "id" | "code" | "dateCreation" | "statut" | "points">,
  ): string => {
    const code = genererCode()
    const signalement: Signalement = {
      ...nouveauSignalement,
      id: Date.now().toString(),
      code,
      dateCreation: new Date(),
      statut: "Soumise",
      points: 10,
    }

    setSignalements((prev) => [...prev, signalement])
    return code
  }

  const modifierStatut = (id: string, statut: Signalement["statut"]) => {
    setSignalements((prev) => prev.map((s) => (s.id === id ? { ...s, statut } : s)))
  }

  const obtenirSignalementParCode = (code: string): Signalement | undefined => {
    return signalements.find((s) => s.code === code)
  }

  const filtrerSignalements = (type?: string, quartier?: string): Signalement[] => {
    return signalements.filter((s) => {
      if (type && s.type !== type) return false
      if (quartier && s.quartier !== quartier) return false
      return true
    })
  }

  return (
    <SignalementContext.Provider
      value={{
        signalements,
        ajouterSignalement,
        modifierStatut,
        obtenirSignalementParCode,
        filtrerSignalements,
      }}
    >
      {children}
    </SignalementContext.Provider>
  )
}

export function useSignalements() {
  const context = useContext(SignalementContext)
  if (context === undefined) {
    throw new Error("useSignalements must be used within a SignalementProvider")
  }
  return context
}
