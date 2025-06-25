"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, MapPin, Calendar, Eye } from "lucide-react"
import { useSignalements } from "@/contexts/SignalementContext"

const TYPES_INCIDENTS = [
  "Tous",
  "Trou dans la chaussée",
  "Éclairage défectueux",
  "Déchets non ramassés",
  "Fuite d'eau",
  "Graffiti",
  "Mobilier urbain cassé",
  "Signalisation manquante",
  "Autre",
]

const QUARTIERS = [
  "Tous",
  "Gueliz",
  "Medina",
  "Hivernage",
  "Agdal",
  "Semlalia",
  "Daoudiate",
  "Sidi Youssef Ben Ali",
  "Autre",
]

export default function PublicPage() {
  const [recherche, setRecherche] = useState("")
  const [filtreType, setFiltreType] = useState("Tous")
  const [filtreQuartier, setFiltreQuartier] = useState("Tous")
  const [filtreStatut, setFiltreStatut] = useState("Tous")

  const { signalements } = useSignalements()

  // 1. Ajouter un état pour gérer les votes d'importance :
  const [votesImportance, setVotesImportance] = useState<Record<string, number>>({})
  const [signalementsVotes, setSignalementsVotes] = useState<Record<string, boolean>>({})

  const signalementsFiltrés = useMemo(() => {
    return signalements.filter((signalement) => {
      const matchRecherche =
        signalement.description.toLowerCase().includes(recherche.toLowerCase()) ||
        signalement.localisation.toLowerCase().includes(recherche.toLowerCase()) ||
        signalement.code.toLowerCase().includes(recherche.toLowerCase())

      const matchType = filtreType === "Tous" || signalement.type === filtreType
      const matchQuartier = filtreQuartier === "Tous" || signalement.quartier === filtreQuartier
      const matchStatut = filtreStatut === "Tous" || signalement.statut === filtreStatut

      return matchRecherche && matchType && matchQuartier && matchStatut
    })
  }, [signalements, recherche, filtreType, filtreQuartier, filtreStatut])

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "Résolu":
        return (
          <Badge className="bg-gradient-to-r from-marrakech-green to-marrakech-blue text-white shadow-sm">Résolu</Badge>
        )
      case "En traitement":
        return (
          <Badge className="bg-gradient-to-r from-marrakech-orange to-marrakech-gold text-white shadow-sm">
            En traitement
          </Badge>
        )
      case "Soumise":
        return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm">Soumise</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const stats = {
    total: signalements.length,
    soumises: signalements.filter((s) => s.statut === "Soumise").length,
    enTraitement: signalements.filter((s) => s.statut === "En traitement").length,
    resolus: signalements.filter((s) => s.statut === "Résolu").length,
  }

  // 2. Ajouter une fonction pour gérer les votes d'importance :
  const marquerCommeImportant = (signalementId: string) => {
    if (signalementsVotes[signalementId]) return // Déjà voté

    setVotesImportance((prev) => ({
      ...prev,
      [signalementId]: (prev[signalementId] || 0) + 1,
    }))

    setSignalementsVotes((prev) => ({
      ...prev,
      [signalementId]: true,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/20 to-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Signalements publics</h1>
          <p className="text-gray-600">Consultez tous les signalements de la communauté et leur statut</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-marrakech-gradient text-white rounded-t-lg">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Signalements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-marrakech-orange to-marrakech-gold text-white rounded-t-lg">
              <CardTitle className="text-sm font-medium">Soumises</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.soumises}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-majorelle-gradient text-white rounded-t-lg">
              <CardTitle className="text-sm font-medium">En traitement</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.enTraitement}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-marrakech-green to-marrakech-blue text-white rounded-t-lg">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolus}</div>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>
            <CardDescription>Filtrez les signalements par type, quartier ou statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filtreType} onValueChange={setFiltreType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'incident" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_INCIDENTS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtreQuartier} onValueChange={setFiltreQuartier}>
                <SelectTrigger>
                  <SelectValue placeholder="Quartier" />
                </SelectTrigger>
                <SelectContent>
                  {QUARTIERS.map((quartier) => (
                    <SelectItem key={quartier} value={quartier}>
                      {quartier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous les statuts</SelectItem>
                  <SelectItem value="Soumise">Soumise</SelectItem>
                  <SelectItem value="En traitement">En traitement</SelectItem>
                  <SelectItem value="Résolu">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(filtreType !== "Tous" || filtreQuartier !== "Tous" || filtreStatut !== "Tous" || recherche) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRecherche("")
                    setFiltreType("Tous")
                    setFiltreQuartier("Tous")
                    setFiltreStatut("Tous")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Signalements ({signalementsFiltrés.length})</CardTitle>
            <CardDescription>Liste de tous les signalements correspondant à vos critères</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Quartier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Importance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signalementsFiltrés.map((signalement) => (
                    <TableRow key={signalement.id}>
                      <TableCell>{signalement.type}</TableCell>
                      <TableCell className="max-w-xs truncate">{signalement.description}</TableCell>
                      <TableCell>{signalement.localisation}</TableCell>
                      <TableCell>{signalement.quartier}</TableCell>
                      <TableCell>{signalement.dateCreation.toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{getStatutBadge(signalement.statut)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={signalementsVotes[signalement.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => marquerCommeImportant(signalement.id)}
                            disabled={signalementsVotes[signalement.id]}
                            className={signalementsVotes[signalement.id] ? "bg-red-500 hover:bg-red-600" : ""}
                          >
                            {signalementsVotes[signalement.id] ? "Marqué" : "Important"}
                          </Button>
                          <Badge variant="secondary" className="ml-1">
                            {votesImportance[signalement.id] || 0}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {signalementsFiltrés.length === 0 && (
                <div className="text-center py-8 text-gray-500">Aucun signalement trouvé avec ces critères</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
