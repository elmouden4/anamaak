"use client"

import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Search, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSignalements } from "@/contexts/SignalementContext"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [codeSuivi, setCodeSuivi] = useState("")
  const [signalementTrouve, setSignalementTrouve] = useState<any>(null)
  const { obtenirSignalementParCode, signalements } = useSignalements()
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

    const signalement = obtenirSignalementParCode(codeSuivi.trim())
    if (signalement) {
      setSignalementTrouve(signalement)
    } else {
      toast({
        title: "Signalement non trouvé",
        description: "Aucun signalement trouvé avec ce code",
        variant: "destructive",
      })
      setSignalementTrouve(null)
    }
  }

  const typesSignalements = [
    {
      titre: "Voirie",
      description: "Trous dans la chaussée, nids de poule",
      icon: "🛣️",
      image: "/1.png",
      couleur: "from-marrakech-red to-marrakech-orange",
      exemples: ["Trous dans la chaussée", "Fissures", "Revêtement dégradé"],
    },
    {
      titre: "Éclairage public",
      description: "Lampadaires défectueux ou éteints",
      icon: "💡",
      image: "/2.jpg",
      couleur: "from-marrakech-gold to-marrakech-sunset",
      exemples: ["Lampadaires cassés", "Éclairage insuffisant", "Pannes électriques"],
    },
    {
      titre: "Propreté",
      description: "Déchets non ramassés, dépôts sauvages",
      icon: "🗑️",
      image: "/3.jpg",
      couleur: "from-marrakech-green to-marrakech-blue",
      exemples: ["Déchets non ramassés", "Dépôts sauvages", "Conteneurs pleins"],
    },
    {
      titre: "Espaces verts",
      description: "Dégradations, arrosage défaillant",
      icon: "🌳",
      image: "/4.jpg",
      couleur: "from-marrakech-blue to-marrakech-green",
      exemples: ["Arbres malades", "Pelouses dégradées", "Arrosage défaillant"],
    },
    {
      titre: "Nuisance à la tranquillité publique",
      description: "Signaler tout comportement ou situation troublant l'ordre, la sécurité ou le cadre de vie",
      icon: "🔍",
      image: "/5.webp",
      couleur: "from-marrakech-sunset to-marrakech-red",
      exemples: [
        "Attroupements suspects ou bruyants",
        "Nuisances sonores répétées",
        "Pollution de l'air ou odeurs anormales",
        "Tags, dégradations, poubelles incendiées",
        "Conduite dangereuse, incivilités",
        "Occupation abusive de l'espace public",
      ],
    },
    {
      titre: "Autres problèmes",
      description: "Nuisances diverses, dégradations urbaines",
      icon: "⚠️",
      image: "/6.webp",
      couleur: "from-marrakech-terracotta to-marrakech-sand",
      exemples: ["Mobilier cassé", "Graffiti", "Signalisation manquante"],
    },
  ]

  const etapesFonctionnement = [
    {
      numero: 1,
      titre: "Je repère un incident",
      description: "Dans ma rue, mon quartier ou ailleurs à Marrakech",
      icon: "👀",
      couleur: "bg-marrakech-red",
    },
    {
      numero: 2,
      titre: "Je remplis le formulaire",
      description: "Simple et rapide, sans compte nécessaire",
      icon: "📝",
      couleur: "bg-marrakech-orange",
    },
    {
      numero: 3,
      titre: "Je reçois un code de suivi",
      description: "Pour suivre l'évolution de mon signalement",
      icon: "🔍",
      couleur: "bg-marrakech-gold",
    },
  ]

  const benefices = [
    {
      titre: "Réduction des risques d'accidents",
      description: "Signaler les dangers pour protéger tous les citoyens",
      icon: "🛡️",
    },
    {
      titre: "Amélioration de la qualité de vie",
      description: "Une ville plus propre et mieux entretenue pour tous",
      icon: "🏙️",
    },
    {
      titre: "Réactivité des services municipaux",
      description: "Accélération des interventions grâce à vos signalements",
      icon: "⚡",
    },
  ]

  const actualites = [
    {
      titre: "127 signalements résolus ce mois",
      description: "Merci à tous les citoyens engagés !",
      date: "Il y a 2 jours",
      type: "success",
    },
    {
      titre: "Campagne de propreté - Quartier Gueliz",
      description: "Opération spéciale du 15 au 30 janvier",
      date: "Il y a 1 semaine",
      type: "info",
    },
    {
      titre: "Nouveau: Signalement d'espaces verts",
      description: "Vous pouvez maintenant signaler les problèmes de jardins",
      date: "Il y a 2 semaines",
      type: "feature",
    },
  ]

  const statsGlobales = {
    signalementsTraites: 1247,
    citoyensActifs: 1234,
    tempsReponse: "48h",
    tauxResolution: 89,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marrakech-sand via-white to-marrakech-terracotta/20">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-marrakech-gold/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-marrakech-blue/10 rounded-full blur-xl"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenu texte à gauche */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Ana<span className="text-marrakech-red">MaaK</span>
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Participez à l'amélioration de votre ville en signalant les incidents autour de vous.
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Chaque citoyen peut être acteur du changement. Ensemble, améliorons Marrakech !
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-marrakech-gradient hover:opacity-90 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Link href="/signaler" className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Signaler un incident
                  </Link>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2 border-marrakech-red text-marrakech-red hover:bg-marrakech-red hover:text-white transition-all duration-200"
                    >
                      <Search className="h-5 w-5" />
                      Suivre un signalement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Suivre votre signalement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="code">Code de suivi</Label>
                        <Input
                          id="code"
                          placeholder="SIG-2024-XXXX"
                          value={codeSuivi}
                          onChange={(e) => setCodeSuivi(e.target.value)}
                        />
                      </div>
                      <Button onClick={rechercherSignalement} className="w-full">
                        Rechercher
                      </Button>

                      {signalementTrouve && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">{signalementTrouve.code}</CardTitle>
                            <CardDescription>{signalementTrouve.type}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p>
                                <strong>Description:</strong> {signalementTrouve.description}
                              </p>
                              <p>
                                <strong>Localisation:</strong> {signalementTrouve.localisation}
                              </p>
                              <p>
                                <strong>Statut:</strong>
                                <span
                                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                    signalementTrouve.statut === "Résolu"
                                      ? "bg-green-100 text-green-800"
                                      : signalementTrouve.statut === "En traitement"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {signalementTrouve.statut}
                                </span>
                              </p>
                              <p>
                                <strong>Date:</strong> {signalementTrouve.dateCreation.toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats rapides sous les boutons */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-marrakech-red">1,247</div>
                  <div className="text-sm text-gray-600">Signalements traités</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-marrakech-orange">48h</div>
                  <div className="text-sm text-gray-600">Temps de réponse</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-marrakech-green">89%</div>
                  <div className="text-sm text-gray-600">Taux de résolution</div>
                </div>
              </div>
            </div>

            {/* Image à droite */}
            <div className="relative lg:block">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Bordure décorative */}
                <div className="absolute inset-0 bg-marrakech-gradient p-1 rounded-2xl">
                  <div className="w-full h-full bg-white rounded-xl"></div>
                </div>

                {/* Image principale */}
                <div className="relative z-10 p-1">
                  <img
                    src="/kech.jpg"
                    alt="Vue de Marrakech - Amélioration urbaine"
                    className="w-full h-auto max-h-[600px] object-cover rounded-xl"
                  />
                </div>

                {/* Overlay avec informations et galerie */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-marrakech-gradient rounded-full flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Marrakech en action</h3>
                        <p className="text-sm text-gray-600">Ensemble pour une ville meilleure</p>
                      </div>
                    </div>
                    
                    {/* Galerie de photos */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="relative group cursor-pointer">
                        <img
                          src="/kech10.jpg"
                          alt="Amélioration urbaine - Avant"
                          className="w-full h-16 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-md transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Avant</span>
                        </div>
                      </div>
                      <div className="relative group cursor-pointer">
                        <img
                          src="/kech2.jpg"
                          alt="Amélioration urbaine - Après"
                          className="w-full h-16 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-md transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Après</span>
                        </div>
                      </div>
                      <div className="relative group cursor-pointer">
                        <img
                          src="/kech20.png"
                          alt="Travaux en cours"
                          className="w-full h-16 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-md transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Travaux</span>
                        </div>
                      </div>
                      <div className="relative group cursor-pointer">
                        <img
                          src="/kech4.webp"
                          alt="Voir plus de photos"
                          className="w-full h-16 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-marrakech-red/80 rounded-md transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+5</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      📸 Découvrez les améliorations récentes dans votre ville
                    </p>
                  </div>
                </div>
              </div>

              {/* Éléments décoratifs flottants */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-marrakech-gold/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-marrakech-blue/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Types de signalements */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📸 Que pouvez-vous signaler ?</h2>
            <p className="text-gray-600">Découvrez les différents types d'incidents que vous pouvez nous signaler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typesSignalements.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${type.couleur}`}></div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={type.image || "/placeholder.svg"}
                    alt={type.titre}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <span className="text-2xl">{type.icon}</span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{type.titre}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Exemples :</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {type.exemples.map((exemple, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-marrakech-gold rounded-full"></span>
                          {exemple}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>



        {/* Fonctionnement en 3 étapes */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🧑‍💻 Comment ça marche ?</h2>
            <p className="text-gray-600">Signaler un incident n'a jamais été aussi simple</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {etapesFonctionnement.map((etape, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${etape.couleur} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg`}
                >
                  {etape.icon}
                </div>
                <div
                  className={`w-8 h-8 ${etape.couleur} rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-4`}
                >
                  {etape.numero}
                </div>
                <h3 className="text-xl font-semibold mb-2">{etape.titre}</h3>
                <p className="text-gray-600">{etape.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 p-6 bg-gradient-to-r from-marrakech-sand/20 to-marrakech-terracotta/20 rounded-lg">
            <p className="text-lg font-medium text-gray-800">
              🔐 <strong>Aucune donnée personnelle requise</strong> pour signaler un problème
            </p>
            <p className="text-gray-600 mt-2">
              Vos contributions sont anonymes (sauf si vous créez un compte pour suivre vos actions)
            </p>
          </div>
        </section>

        {/* Pourquoi signaler */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🎯 Pourquoi faire un signalement ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 bg-gradient-to-br from-marrakech-red/5 to-marrakech-orange/5">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="font-semibold mb-2">Parce que chaque citoyen compte</h3>
              <p className="text-gray-600 text-sm">Vous êtes les yeux et les oreilles de votre quartier</p>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-marrakech-blue/5 to-marrakech-green/5">
              <div className="text-3xl mb-4">👀</div>
              <h3 className="font-semibold mb-2">Les autorités ne voient pas tout</h3>
              <p className="text-gray-600 text-sm">Votre aide est précieuse pour identifier les problèmes</p>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-marrakech-gold/5 to-marrakech-sunset/5">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">Plus on signale, mieux c'est</h3>
              <p className="text-gray-600 text-sm">Les données aident à prioriser les interventions</p>
            </Card>
          </div>
        </section>

        {/* Bénéfices à long terme */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🏙 Bénéfices pour Marrakech</h2>
            <p className="text-gray-600">Ensemble, construisons une ville meilleure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefices.map((benefice, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">{benefice.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{benefice.titre}</h3>
                  <p className="text-gray-600">{benefice.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Encouragement participation */}
        <section className="mb-16">
          <Card className="bg-marrakech-gradient text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="text-5xl mb-4">🎖️</div>
              <h2 className="text-3xl font-bold mb-4">Devenez un Bon Citoyen 👏</h2>
              <p className="text-xl mb-6 opacity-90">Chaque signalement vous rapporte des points !</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{statsGlobales.signalementsTraites}</div>
                  <div className="text-sm opacity-80">Signalements traités</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{statsGlobales.citoyensActifs}</div>
                  <div className="text-sm opacity-80">Citoyens actifs</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{statsGlobales.tempsReponse}</div>
                  <div className="text-sm opacity-80">Temps de réponse</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{statsGlobales.tauxResolution}%</div>
                  <div className="text-sm opacity-80">Taux de résolution</div>
                </div>
              </div>

              <Button asChild size="lg" variant="secondary" className="bg-white text-marrakech-red hover:bg-white/90">
                <Link href="/signaler">Commencer maintenant</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Zone actualités */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📣 Actualités & Annonces</h2>
            <p className="text-gray-600">Restez informé des dernières nouvelles de votre ville</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actualites.map((actu, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        actu.type === "success"
                          ? "bg-green-500"
                          : actu.type === "info"
                            ? "bg-blue-500"
                            : "bg-purple-500"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-500">{actu.date}</span>
                  </div>
                  <CardTitle className="text-lg">{actu.titre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{actu.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements actifs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+12% ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problèmes résolus</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citoyens actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">Contributeurs</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ensemble, améliorons Marrakech</h2>
          <p className="text-lg text-gray-600 mb-8">
            Chaque signalement compte. Rejoignez la communauté des citoyens engagés !
          </p>
          <Button asChild size="lg" variant="outline">
            <Link href="/public">Voir tous les signalements</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
