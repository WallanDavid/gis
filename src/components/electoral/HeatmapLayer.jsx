import { LayerGroup, CircleMarker } from 'react-leaflet'

export default function HeatmapLayer({ pontos, cor, opacity }) {
  return (
    <LayerGroup>
      {pontos.map((p) => {
        const r = Math.max(10, Math.min(40, Math.sqrt(p.votos)))
        return (
          <CircleMarker
            key={`heat-${p.id}`}
            center={[p.latitude, p.longitude]}
            radius={r}
            pathOptions={{ color: cor, fillColor: cor, fillOpacity: Math.min(opacity, 0.35) }}
          />
        )
      })}
    </LayerGroup>
  )
}
