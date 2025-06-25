"use client"

import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, TrendingUp, Target, Star, Trophy } from "lucide-react"
import { useSignalements } from "@/contexts/SignalementContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { signalements } = useSignalements()
  const { user } = useAuth()

  // Simulation des données utilisateur basées sur l'utilisateur connecté
  const mesSignalements = signalements.slice(0, 3) // Simule les signalements de l'utilisateur
  const totalPoints = user?.points || mesSignalements.reduce((acc, s) => acc + s.points, 0)

  const prochainBadge = 100
  const progressBadge = (totalPoints / prochainBadge) * 100

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Résolu":
        return <Badge className="bg-green-100 text-green-800">Résolu</Badge>
      case "En traitement":
        return <Badge className="bg-yellow-100 text-yellow-800">En traitement</Badge>
      case "Soumise":
        return <Badge className="bg-gray-100 text-gray-800">Soumise</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const badges = [
    { nom: "Premier signalement", description: "Votre premier signalement", obtenu: true, icon: Star },
    { nom: "Citoyen actif", description: "5 signalements", obtenu: false, icon: Target },
    { nom: "Super citoyen", description: "10 signalements", obtenu: false, icon: Trophy },
    { nom: "Héros de Marrakech", description: "25 signalements", obtenu: false, icon: Award },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/20 via-white to-marrakech-terracotta/10">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Dashboard</h1>
            <p className="text-gray-600">Suivez vos signalements et votre progression en tant que bon citoyen</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-marrakech-gradient text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">Mes signalements</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mesSignalements.length}</div>
                <p className="text-xs text-muted-foreground">Total envoyés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-sunset-gradient text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">Points gagnés</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                <p className="text-xs text-muted-foreground">Points bon citoyen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-majorelle-gradient text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">Résolus</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {mesSignalements.filter((s) => s.statut === "Résolu").length}
                </div>
                <p className="text-xs text-muted-foreground">Problèmes résolus</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-marrakech-gold to-marrakech-orange text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">Rang</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">#47</div>
                <p className="text-xs text-muted-foreground">Sur 1,234 citoyens</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress vers le prochain badge */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Progression vers le prochain badge
                  </CardTitle>
                  <CardDescription>Continuez à signaler pour débloquer de nouveaux badges !</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Citoyen actif (5 signalements)</span>
                      <span className="text-sm text-gray-500">{mesSignalements.length}/5</span>
                    </div>
                    <Progress value={(mesSignalements.length / 5) * 100} className="h-3" />
                    <p className="text-sm text-gray-600">
                      Encore <strong>{5 - mesSignalements.length} signalements</strong> pour recevoir le badge "Citoyen
                      actif" !
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mes signalements */}
              <Card>
                <CardHeader>
                  <CardTitle>Mes signalements récents</CardTitle>
                  <CardDescription>Historique de vos signalements et leur statut actuel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Localisation</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mesSignalements.map((signalement) => (
                          <TableRow key={signalement.id}>
                            <TableCell className="font-mono text-sm">{signalement.code}</TableCell>
                            <TableCell>{signalement.type}</TableCell>
                            <TableCell>{signalement.localisation}</TableCell>
                            <TableCell>{signalement.dateCreation.toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>{getStatutBadge(signalement.statut)}</TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">+{signalement.points}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {mesSignalements.length === 0 && (
                      <div className="text-center py-8 text-gray-500">Vous n'avez pas encore de signalements</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badges et récompenses */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Mes badges
                  </CardTitle>
                  <CardDescription>Vos récompenses de bon citoyen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {badges.map((badge, index) => {
                      const Icon = badge.icon
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            badge.obtenu
                              ? "bg-gradient-to-r from-marrakech-gold/20 to-marrakech-orange/20 border-marrakech-gold/30 shadow-md"
                              : "bg-gray-50 border-gray-200 opacity-60"
                          }`}
                        >
                          <Icon className={`h-8 w-8 ${badge.obtenu ? "text-yellow-500" : "text-gray-400"}`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{badge.nom}</h4>
                            <p className="text-xs text-gray-600">{badge.description}</p>
                          </div>
                          {badge.obtenu && <Badge className="bg-yellow-100 text-yellow-800">Obtenu</Badge>}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Message motivant */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Award className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Continuez comme ça !</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Vous contribuez activement à l'amélioration de Marrakech. Chaque signalement compte !
                    </p>
                    <div className="bg-marrakech-gradient p-3 rounded-lg text-white shadow-md">
                      <p className="font-medium">🏆 Vous êtes dans le top 10% des citoyens les plus actifs !</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
