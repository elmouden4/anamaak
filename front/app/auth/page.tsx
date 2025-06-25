"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus, LogIn, Mail, Lock, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Formulaire de connexion
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Formulaire d'inscription
  const [signupData, setSignupData] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const { login, signup } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const success = await login(loginData.email, loginData.password)
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur AnaMaaK !",
        })
        router.push("/dashboard")
      } else {
        setError("Email ou mot de passe incorrect")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (signupData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
    }

    try {
      const success = await signup(signupData.email, signupData.password, signupData.nom)
      if (success) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès !",
        })
        router.push("/dashboard")
      } else {
        setError("Cet email est déjà utilisé")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/30 via-white to-marrakech-terracotta/20">
      <Navigation />

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rejoignez Ana<span className="text-marrakech-red">MaaK</span>
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour suivre vos signalements et gagner des points de bon citoyen
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="h-2 bg-marrakech-gradient"></div>

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Authentification</CardTitle>
            <CardDescription>Accédez à votre espace personnel</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Onglet Connexion */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-marrakech-gradient hover:opacity-90 shadow-md"
                  >
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>

                {/* Comptes de démonstration */}
                <div className="mt-6 p-4 bg-marrakech-sand/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Comptes de démonstration :</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>Citoyen :</strong> citoyen@marrakech.ma / 123456
                    </div>
                    <div>
                      <strong>Admin :</strong> admin@marrakech.ma / admin123
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Inscription */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-nom">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-nom"
                        type="text"
                        placeholder="Ahmed Benali"
                        value={signupData.nom}
                        onChange={(e) => setSignupData({ ...signupData, nom: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sunset-gradient hover:opacity-90 shadow-md"
                  >
                    {loading ? "Inscription..." : "Créer mon compte"}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🏆 En vous inscrivant, vous rejoignez la communauté des citoyens engagés de Marrakech !
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Avantages */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="text-center p-4">
            <h3 className="font-semibold mb-2">🏆 Système de points</h3>
            <p className="text-sm text-gray-600">Gagnez des points pour chaque signalement et débloquez des badges</p>
          </Card>

          <Card className="text-center p-4">
            <h3 className="font-semibold mb-2">📊 Suivi personnalisé</h3>
            <p className="text-sm text-gray-600">Suivez l'évolution de tous vos signalements en temps réel</p>
          </Card>

          <Card className="text-center p-4">
            <h3 className="font-semibold mb-2">🌟 Impact citoyen</h3>
            <p className="text-sm text-gray-600">Contribuez activement à l'amélioration de votre ville</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
