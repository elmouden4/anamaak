import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { SignalementProvider } from "@/contexts/SignalementContext"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AnaMaaK - Signalements Citoyens Marrakech",
  description: "Application de gestion des signalements citoyens pour la ville de Marrakech",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <SignalementProvider>
            {children}
            <Toaster />
          </SignalementProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
