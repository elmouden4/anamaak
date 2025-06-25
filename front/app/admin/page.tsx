"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Settings, Eye, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { useSignalements, type Signalement } from "@/contexts/SignalementContext"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/ProtectedRoute"

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

export default function AdminPage() {
  const [recherche, setRecherche] = useState("")
  const [filtreType, setFiltreType] = useState("Tous")
  const [filtreQuartier, setFiltreQuartier] = useState("Tous")
  const [filtreStatut, setFiltreStatut] = useState("Tous")
  const [signalementSelectionne, setSignalementSelectionne] = useState<Signalement | null>(null)

  const { signalements, modifierStatut } = useSignalements()
  const { toast } = useToast()

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

  const changerStatut = (id: string, nouveauStatut: Signalement["statut"]) => {
    modifierStatut(id, nouveauStatut)
    toast({
      title: "Statut modifié",
      description: `Le signalement a été marqué comme "${nouveauStatut}"`,
    })
  }

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

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "Résolu":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "En traitement":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Soumise":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const stats = {
    total: signalements.length,
    soumises: signalements.filter((s) => s.statut === "Soumise").length,
    enTraitement: signalements.filter((s) => s.statut === "En traitement").length,
    resolus: signalements.filter((s) => s.statut === "Résolu").length,
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/20 to-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrateur</h1>
            <p className="text-gray-600">Gérez tous les signalements citoyens et leur statut</p>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-500 to-marrakech-orange text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">À traiter</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.soumises}</div>
                <p className="text-xs text-muted-foreground">Nouveaux</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-majorelle-gradient text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">En cours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.enTraitement}</div>
                <p className="text-xs text-muted-foreground">En traitement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-marrakech-green to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-sm font-medium">Résolus</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
              <CardDescription>Filtrez les signalements pour une gestion efficace</CardDescription>
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

          {/* Signalements Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gestion des signalements ({signalementsFiltrés.length})
              </CardTitle>
              <CardDescription>Cliquez sur un signalement pour voir les détails et modifier le statut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Quartier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signalementsFiltrés.map((signalement) => (
                      <TableRow key={signalement.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{signalement.code}</TableCell>
                        <TableCell>{signalement.type}</TableCell>
                        <TableCell className="max-w-xs truncate">{signalement.description}</TableCell>
                        <TableCell>{signalement.localisation}</TableCell>
                        <TableCell>{signalement.quartier}</TableCell>
                        <TableCell>{signalement.dateCreation.toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{getStatutBadge(signalement.statut)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSignalementSelectionne(signalement)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getStatutIcon(signalement.statut)}
                                    Détails du signalement {signalement.code}
                                  </DialogTitle>
                                  <DialogDescription>Informations complètes et gestion du statut</DialogDescription>
                                </DialogHeader>

                                {signalementSelectionne && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Informations générales</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <strong>Code:</strong> {signalementSelectionne.code}
                                          </div>
                                          <div>
                                            <strong>Type:</strong> {signalementSelectionne.type}
                                          </div>
                                          <div>
                                            <strong>Date:</strong>{" "}
                                            {signalementSelectionne.dateCreation.toLocaleDateString("fr-FR")}
                                          </div>
                                          <div>
                                            <strong>Points:</strong> {signalementSelectionne.points}
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="font-semibold mb-2">Localisation</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <strong>Adresse:</strong> {signalementSelectionne.localisation}
                                          </div>
                                          <div>
                                            <strong>Quartier:</strong> {signalementSelectionne.quartier}
                                          </div>
                                          {signalementSelectionne.photo && (
                                            <div>
                                              <strong>Photo:</strong> {signalementSelectionne.photo}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Description</h4>
                                      <p className="text-sm bg-gray-50 p-3 rounded-lg">
                                        {signalementSelectionne.description}
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Changer le statut</h4>
                                      <div className="flex gap-2">
                                        <Button
                                          variant={signalementSelectionne.statut === "Soumise" ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => changerStatut(signalementSelectionne.id, "Soumise")}
                                          className={
                                            signalementSelectionne.statut === "Soumise"
                                              ? "bg-gray-500 hover:bg-gray-600"
                                              : "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                                          }
                                        >
                                          Soumise
                                        </Button>
                                        <Button
                                          variant={
                                            signalementSelectionne.statut === "En traitement" ? "default" : "outline"
                                          }
                                          size="sm"
                                          onClick={() => changerStatut(signalementSelectionne.id, "En traitement")}
                                          className={
                                            signalementSelectionne.statut === "En traitement"
                                              ? "bg-marrakech-gradient"
                                              : "border-marrakech-orange text-marrakech-orange hover:bg-marrakech-orange hover:text-white"
                                          }
                                        >
                                          En traitement
                                        </Button>
                                        <Button
                                          variant={signalementSelectionne.statut === "Résolu" ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => changerStatut(signalementSelectionne.id, "Résolu")}
                                          className={
                                            signalementSelectionne.statut === "Résolu"
                                              ? "bg-marrakech-green hover:bg-green-600"
                                              : "border-marrakech-green text-marrakech-green hover:bg-marrakech-green hover:text-white"
                                          }
                                        >
                                          Résolu
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Select
                              value={signalement.statut}
                              onValueChange={(value) => changerStatut(signalement.id, value as Signalement["statut"])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Soumise">Soumise</SelectItem>
                                <SelectItem value="En traitement">En traitement</SelectItem>
                                <SelectItem value="Résolu">Résolu</SelectItem>
                              </SelectContent>
                            </Select>
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
    </ProtectedRoute>
  )
}
