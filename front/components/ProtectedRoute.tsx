"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, isAdmin, requireAdmin, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/20 to-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-marrakech-red mb-4" />
            <p className="text-gray-600">Redirection vers la page de connexion...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/20 to-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Lock className="h-8 w-8 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p className="text-gray-600 text-center">Cette page est réservée aux administrateurs.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
