"use client"

import { useEffect, useRef } from "react"

interface LeafletMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedPosition?: { lat: number; lng: number } | null
}

export function LeafletMap({ onLocationSelect, selectedPosition }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      // Charger le CSS de Leaflet
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)
      }

      // Charger le JS de Leaflet
      if (typeof window !== "undefined" && !(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        script.crossOrigin = ""

        script.onload = () => {
          initializeMap()
        }

        document.head.appendChild(script)
      } else if ((window as any).L) {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = (window as any).L

      // Initialiser la carte centrée sur Marrakech
      const map = L.map(mapRef.current).setView([31.6295, -7.9811], 13)
      mapInstanceRef.current = map

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Gérer les clics sur la carte
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng
        onLocationSelect(lat, lng)

        // Supprimer le marqueur existant
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }

        // Ajouter un nouveau marqueur
        markerRef.current = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`Position sélectionnée:<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
          .openPopup()
      })

      // Si une position est déjà sélectionnée, l'afficher
      if (selectedPosition) {
        markerRef.current = L.marker([selectedPosition.lat, selectedPosition.lng])
          .addTo(map)
          .bindPopup(
            `Position sélectionnée:<br>Lat: ${selectedPosition.lat.toFixed(6)}<br>Lng: ${selectedPosition.lng.toFixed(6)}`,
          )
      }
    }

    loadLeaflet()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Mettre à jour le marqueur si la position change
  useEffect(() => {
    if (mapInstanceRef.current && selectedPosition) {
      const L = (window as any).L

      // Supprimer le marqueur existant
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }

      // Ajouter le nouveau marqueur
      markerRef.current = L.marker([selectedPosition.lat, selectedPosition.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `Position sélectionnée:<br>Lat: ${selectedPosition.lat.toFixed(6)}<br>Lng: ${selectedPosition.lng.toFixed(6)}`,
        )
    }
  }, [selectedPosition])

  return <div ref={mapRef} className="h-full w-full rounded-lg" />
}
