"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, FileText, Eye, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  const publicNavItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/signaler", label: "Signaler", icon: FileText },
    { href: "/public", label: "Signalements", icon: Eye },
  ]

  const authNavItems = [
    { href: "/dashboard", label: "Mon Dashboard", icon: User },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Settings }] : []),
  ]

  const navItems = isAuthenticated
    ? [...publicNavItems, ...authNavItems]
    : [...publicNavItems, { href: "/auth", label: "Connexion", icon: User }]

  return (
    <nav className="bg-gradient-to-r from-marrakech-red to-marrakech-orange shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white drop-shadow-md">
              AnaMaaK
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  asChild
                  size="sm"
                  className={
                    pathname === item.href
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}

            {isAuthenticated && (
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-sm">Bonjour, {user?.nom}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-white/90 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
