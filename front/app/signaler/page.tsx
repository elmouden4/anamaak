"use client"

import React from "react"

import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Upload, MapPin, FileText, Camera, Award } from "lucide-react"
import { useSignalements } from "@/contexts/SignalementContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LeafletMap } from "@/components/LeafletMap"

const TYPES_INCIDENTS = [
  "Propreté et déchets (dépôts sauvages, égouts, odeurs)",
  "Éclairage public ou feux de signalisation défectueux",
  "Voirie endommagée (nids-de-poule, trottoirs, inondations)",
  "Pollutions (sonores, atmosphériques, odeurs)",
  "Occupation ou encombrement illégal de l'espace public",
  "Attroupements suspects ou nuisances de groupe",
  "Comportements dangereux ou incivilités",
  "Vandalisme ou dégradations (tags, mobilier urbain cassé)",
  "Animaux errants ou dangereux",
  "Signalisation routière absente ou endommagée",
  "Véhicule abandonné ou mal stationné",
  "Arbres dangereux ou tombés",
  "Autre (précisez)",
]

const QUARTIERS = ["Gueliz", "Medina", "Hivernage", "Agdal", "Semlalia", "Daoudiate", "Sidi Youssef Ben Ali", "Autre"]

export default function SignalerPage() {
  const [etapeActuelle, setEtapeActuelle] = useState(1)
  const [formData, setFormData] = useState({
    type: "",
    autreType: "",
    description: "",
    localisation: "",
    quartier: "",
    photo: null as File | null,
  })
  const [codeGenere, setCodeGenere] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [showMap, setShowMap] = useState(false)

  const { ajouterSignalement } = useSignalements()
  const router = useRouter()

  const etapes = [
    { numero: 1, titre: "Type d'incident", icon: FileText },
    { numero: 2, titre: "Description", icon: FileText },
    { numero: 3, titre: "Localisation", icon: MapPin },
    { numero: 4, titre: "Photo (optionnel)", icon: Camera },
    { numero: 5, titre: "Confirmation", icon: CheckCircle },
  ]

  const progressPourcentage = (etapeActuelle / etapes.length) * 100

  const peutContinuer = () => {
    switch (etapeActuelle) {
      case 1:
        return (
          formData.type !== "" &&
          (formData.type !== "Autre (précisez)" || (formData.autreType && formData.autreType.trim() !== ""))
        )
      case 2:
        return formData.description.trim() !== ""
      case 3:
        return formData.localisation.trim() !== "" && formData.quartier !== ""
      case 4:
        return true // Photo optionnelle
      case 5:
        return true
      default:
        return false
    }
  }

  const etapeSuivante = () => {
    if (etapeActuelle < etapes.length) {
      setEtapeActuelle(etapeActuelle + 1)
    }
  }

  const etapePrecedente = () => {
    if (etapeActuelle > 1) {
      setEtapeActuelle(etapeActuelle - 1)
    }
  }

  const soumettreSignalement = () => {
    const code = ajouterSignalement({
      type: formData.type,
      description: formData.description,
      localisation: formData.localisation,
      quartier: formData.quartier,
      photo: formData.photo?.name,
    })

    setCodeGenere(code)
    setShowSuccess(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
    }
  }

  const renderEtape = () => {
    switch (etapeActuelle) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Quel type d'incident souhaitez-vous signaler ?</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type d'incident" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_INCIDENTS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "Autre (précisez)" && (
              <div>
                <Label htmlFor="autreType">Précisez le type d'incident</Label>
                <Input
                  id="autreType"
                  placeholder="Décrivez brièvement le type d'incident..."
                  value={formData.autreType || ""}
                  onChange={(e) => setFormData({ ...formData, autreType: e.target.value })}
                />
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Décrivez l'incident en détail</Label>
              <Textarea
                id="description"
                placeholder="Décrivez précisément le problème que vous avez observé..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="quartier">Quartier</Label>
              <Select
                value={formData.quartier}
                onValueChange={(value) => setFormData({ ...formData, quartier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le quartier" />
                </SelectTrigger>
                <SelectContent>
                  {QUARTIERS.map((quartier) => (
                    <SelectItem key={quartier} value={quartier}>
                      {quartier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="localisation">Adresse ou lieu précis</Label>
              <Input
                id="localisation"
                placeholder="Ex: Avenue Mohammed V, près du café..."
                value={formData.localisation}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
              />
            </div>

            <div>
              <Label>Localisation sur la carte</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Cliquez sur la carte pour sélectionner l'emplacement exact
                  </p>
                  {selectedPosition && (
                    <p className="text-xs text-green-600">
                      Position sélectionnée: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowMap(!showMap)}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {showMap ? "Masquer la carte" : "Afficher la carte"}
                  </Button>
                </div>

                {showMap && (
                  <div className="h-64 w-full">
                    <LeafletMap
                      onLocationSelect={(lat, lng) => setSelectedPosition({ lat, lng })}
                      selectedPosition={selectedPosition}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo">Ajouter une photo (optionnel)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Cliquez pour télécharger</span>
                    <span className="text-gray-500"> ou glissez-déposez</span>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                </div>
              </div>
              {formData.photo && (
                <p className="text-sm text-green-600 mt-2">✓ Photo sélectionnée: {formData.photo.name}</p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Award className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Récapitulatif de votre signalement</h3>
              <p className="text-gray-600">Vérifiez les informations avant de soumettre</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <strong>Type:</strong>{" "}
                {formData.type === "Autre (précisez)" ? `Autre: ${formData.autreType}` : formData.type}
              </div>
              <div>
                <strong>Description:</strong> {formData.description}
              </div>
              <div>
                <strong>Localisation:</strong> {formData.localisation}
              </div>
              <div>
                <strong>Quartier:</strong> {formData.quartier}
              </div>
              <div>
                <strong>Photo:</strong> {formData.photo ? formData.photo.name : "Aucune"}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                🏆 Vous gagnerez <strong>10 points</strong> de bon citoyen pour ce signalement !
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marrakech-sand/30 to-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Signaler un incident</h1>
          <p className="text-gray-600">Aidez-nous à améliorer Marrakech en signalant les problèmes que vous observez</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {etapes.map((etape) => {
              const Icon = etape.icon
              return (
                <div
                  key={etape.numero}
                  className={`flex items-center ${etape.numero <= etapeActuelle ? "text-green-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      etape.numero <= etapeActuelle
                        ? "bg-marrakech-gradient text-white shadow-md"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {etape.numero < etapeActuelle ? <CheckCircle className="h-4 w-4" /> : etape.numero}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:block">{etape.titre}</span>
                </div>
              )
            })}
          </div>
          <Progress value={progressPourcentage} className="h-3 bg-marrakech-sand" />
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(etapes[etapeActuelle - 1].icon, { className: "h-5 w-5" })}
              Étape {etapeActuelle}: {etapes[etapeActuelle - 1].titre}
            </CardTitle>
            <CardDescription>
              {etapeActuelle === 1 && "Sélectionnez le type de problème que vous souhaitez signaler"}
              {etapeActuelle === 2 && "Décrivez le problème en détail pour nous aider à mieux comprendre"}
              {etapeActuelle === 3 && "Indiquez où se trouve exactement le problème"}
              {etapeActuelle === 4 && "Ajoutez une photo pour illustrer le problème (optionnel)"}
              {etapeActuelle === 5 && "Vérifiez vos informations avant de soumettre"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderEtape()}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={etapePrecedente} disabled={etapeActuelle === 1}>
                Précédent
              </Button>

              {etapeActuelle < etapes.length ? (
                <Button
                  onClick={etapeSuivante}
                  disabled={!peutContinuer()}
                  className="bg-marrakech-gradient hover:opacity-90 shadow-md"
                >
                  Suivant
                </Button>
              ) : (
                <Button onClick={soumettreSignalement} className="bg-green-600 hover:bg-green-700">
                  Soumettre mon signalement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                Signalement envoyé avec succès !
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="bg-marrakech-gradient p-4 rounded-lg text-white">
                <p className="text-lg font-semibold">Votre code de suivi :</p>
                <p className="text-2xl font-bold mt-2">{codeGenere}</p>
              </div>

              <div className="bg-sunset-gradient p-4 rounded-lg text-white">
                <p>
                  🏆 Félicitations ! Vous avez gagné <strong>10 points</strong> de bon citoyen !
                </p>
                <p className="text-sm mt-2 opacity-90">
                  <Link href="/auth" className="underline hover:no-underline">
                    Connectez-vous
                  </Link>{" "}
                  pour collecter vos points et suivre vos contributions
                </p>
              </div>

              <p className="text-gray-600 text-sm">
                Conservez ce code pour suivre l'évolution de votre signalement. Vous recevrez des notifications sur les
                mises à jour.
              </p>

              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.push("/")} variant="outline">
                  Retour à l'accueil
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccess(false)
                    setEtapeActuelle(1)
                    setFormData({
                      type: "",
                      autreType: "",
                      description: "",
                      localisation: "",
                      quartier: "",
                      photo: null,
                    })
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Nouveau signalement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
