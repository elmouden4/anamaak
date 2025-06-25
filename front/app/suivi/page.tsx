"use client"

import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react"
import { useSignalements } from "@/contexts/SignalementContext"
import { useToast } from "@/hooks/use-toast"

export default function SuiviPage() {
  const [codeSuivi, setCodeSuivi] = useState("")
  const [signalementTrouve, setSignalementTrouve] = useState<any>(null)
  const [recherche, setRecherche] = useState(false)

  const { obtenirSignalementParCode } = useSignalements()
  const { toast } = useToast()

  const rechercherSignalement = () => {
    if (!codeSuivi.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code de suivi",
        variant: "destructive",
      })
      return
    }

    setRecherche(true)
    const signalement = obtenirSignalementParCode(codeSuivi.trim())

    setTimeout(() => {
      if (signalement) {
        setSignalementTrouve(signalement)
        toast({
          title: "Signalement trouvé",
          description: "Voici les détails de votre signalement",
        })
      } else {
        toast({
          title: "Signalement non trouvé",
          description: "Aucun signalement trouvé avec ce code",
          variant: "destructive",
        })
        setSignalementTrouve(null)
      }
      setRecherche(false)
    }, 1000)
  }

  const getStatutInfo = (statut: string) => {
    switch (statut) {
      case "Résolu":
        return {
          badge: (
            <Badge className="bg-gradient-to-r from-marrakech-green to-marrakech-blue text-white shadow-sm">
              Résolu
            </Badge>
          ),
          icon: <CheckCircle className="h-6 w-6 text-marrakech-green" />,
          color: "text-marrakech-green",
          description: "Votre signalement a été traité et le problème est résolu !",
        }
      case "En traitement":
        return {
          badge: <Badge className="bg-sunset-gradient text-white shadow-sm">En traitement</Badge>,
          icon: <Clock className="h-6 w-6 text-marrakech-orange" />,
          color: "text-marrakech-orange",
          description: "Votre signalement est en cours de traitement par nos équipes.",
        }
      case "Soumise":
        return {
          badge: <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm">Soumise</Badge>,
          icon: <AlertTriangle className="h-6 w-6 text-gray-600" />,
          color: "text-gray-600",
          description: "Votre signalement a été reçu et sera traité prochainement.",
        }
      default:
        return {
          badge: <Badge variant="secondary">{statut}</Badge>,
          icon: <AlertTriangle className="h-6 w-6 text-gray-600" />,
          color: "text-gray-600",
          description: "Statut du signalement",
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/20 to-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivre un signalement</h1>
          <p className="text-gray-600">Entrez votre code de suivi pour connaître l'état de votre signalement</p>
        </div>

        {/* Formulaire de recherche */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Rechercher votre signalement
            </CardTitle>
            <CardDescription>Utilisez le code de suivi que vous avez reçu lors de votre signalement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code de suivi</Label>
                <Input
                  id="code"
                  placeholder="SIG-2024-XXXX"
                  value={codeSuivi}
                  onChange={(e) => setCodeSuivi(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && rechercherSignalement()}
                />
                <p className="text-sm text-gray-500 mt-1">Format: SIG-YYYY-XXXX (ex: SIG-2024-0001)</p>
              </div>
              <Button
                onClick={rechercherSignalement}
                disabled={recherche}
                className="w-full sm:w-auto bg-marrakech-gradient hover:opacity-90 shadow-md"
              >
                {recherche ? "Recherche en cours..." : "Rechercher"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultat de la recherche */}
        {signalementTrouve && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatutInfo(signalementTrouve.statut).icon}
                Signalement {signalementTrouve.code}
              </CardTitle>
              <CardDescription>Signalé le {signalementTrouve.dateCreation.toLocaleDateString("fr-FR")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Statut principal */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="mb-4">{getStatutInfo(signalementTrouve.statut).icon}</div>
                  <div className="mb-2">{getStatutInfo(signalementTrouve.statut).badge}</div>
                  <p className="text-gray-600">{getStatutInfo(signalementTrouve.statut).description}</p>
                </div>

                {/* Détails du signalement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Détails du problème
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Type:</strong> {signalementTrouve.type}
                      </div>
                      <div>
                        <strong>Description:</strong>
                      </div>
                      <p className="bg-white p-3 rounded border text-gray-700">{signalementTrouve.description}</p>
                      {signalementTrouve.photo && (
                        <div>
                          <strong>Photo:</strong> {signalementTrouve.photo}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 mt-6 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Informations
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Date de signalement:</strong>{" "}
                        {signalementTrouve.dateCreation.toLocaleDateString("fr-FR")}
                      </div>
                      <div>
                        <strong>Points gagnés:</strong>
                        <span className="text-green-600 font-semibold ml-1">+{signalementTrouve.points}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline du statut */}
                <div>
                  <h3 className="font-semibold mb-3">Historique du traitement</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Signalement soumis</div>
                        <div className="text-xs text-gray-500">
                          {signalementTrouve.dateCreation.toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>

                    {signalementTrouve.statut !== "Soumise" && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Pris en charge</div>
                          <div className="text-xs text-gray-500">En cours de traitement</div>
                        </div>
                      </div>
                    )}

                    {signalementTrouve.statut === "Résolu" && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Problème résolu</div>
                          <div className="text-xs text-gray-500">Traitement terminé</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message de remerciement */}
                <div className="bg-marrakech-gradient p-4 rounded-lg text-white shadow-md">
                  <h4 className="font-semibold mb-2">Merci pour votre contribution !</h4>
                  <p className="text-sm opacity-90">
                    Votre signalement aide à améliorer la qualité de vie à Marrakech. Continuez à nous signaler les
                    problèmes que vous observez !
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Besoin d'aide ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Où trouver mon code de suivi ?</strong>
              </p>
              <p>
                Votre code de suivi vous a été fourni lors de la soumission de votre signalement. Il est au format
                SIG-YYYY-XXXX.
              </p>

              <p>
                <strong>Que signifient les différents statuts ?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Soumise :</strong> Votre signalement a été reçu et est en attente de traitement
                </li>
                <li>
                  <strong>En traitement :</strong> Nos équipes travaillent sur la résolution du problème
                </li>
                <li>
                  <strong>Résolu :</strong> Le problème a été traité et résolu
                </li>
              </ul>

              <p>
                <strong>Combien de temps faut-il pour traiter un signalement ?</strong>
              </p>
              <p>
                Le délai varie selon le type de problème, mais nous nous efforçons de traiter tous les signalements dans
                les plus brefs délais.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
