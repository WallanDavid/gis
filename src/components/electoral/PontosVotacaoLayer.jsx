import { CircleMarker, LayerGroup, Popup } from 'react-leaflet'

export default function PontosVotacaoLayer({ pontos, cor, opacity }) {
  return (
    <LayerGroup>
      {(pontos || []).map((p) => {
        const radius = Math.max(4, Math.min(18, Math.sqrt(p.votos) / 3))
        return (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={radius}
            pathOptions={{ color: cor, fillColor: cor, fillOpacity: opacity }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{p.local}</div>
                <div>{p.bairro} — {p.municipio}</div>
                <div>Votos: {p.votos}</div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </LayerGroup>
  )
}
