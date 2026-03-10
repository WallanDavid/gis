import { LayerGroup, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'

function icon(color) {
  return L.divIcon({
    className: 'proj-icon',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #111;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

export default function ProjetosLayer({ nuclei, participants, visMode, onFocusRegion }) {
  const showN = visMode === 'nucleos' || visMode === 'ambos'
  const showP = visMode === 'participantes' || visMode === 'ambos'
  return (
    <LayerGroup>
      {showN
        ? nuclei.map((n) => (
            <Marker key={n.id} position={[n.coordenadas[0], n.coordenadas[1]]} icon={icon(n.cor)}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{n.projetoNome}</div>
                  <div>{n.nome}</div>
                  <div>Início: {n.dataInicio}</div>
                  <div>Endereço: {n.endereco}</div>
                  <div>Pessoas: {n.totalPessoas}</div>
                  <div className="text-sm">
                    Pessoas:
                    <ul className="list-disc ml-5">
                      {Array.from({ length: Math.min(5, n.pessoas.length) }).map((_, i) => {
                        const p = n.pessoas[i]
                        const multi = p.projetos.length > 1
                        return <li key={p.id}>{p.nome} {multi ? '✨' : ''}</li>
                      })}
                    </ul>
                  </div>
                  <button
                    className="text-xs text-blue-600"
                    onClick={() => onFocusRegion(n.municipio, n.bairro)}
                  >
                    📊 Ver desempenho eleitoral nesta região
                  </button>
                </div>
              </Popup>
            </Marker>
          ))
        : null}
      {showP
        ? participants.map((p) => (
            <CircleMarker
              key={p.id + p.nucleoId}
              center={[p.enderecoResidencial.coordenadas[0], p.enderecoResidencial.coordenadas[1]]}
              radius={p.multi ? 7 : 5}
              pathOptions={{
                color: p.multi ? '#f59e0b' : p.cor,
                fillColor: p.multi ? '#f59e0b' : p.cor,
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{p.nome} {p.multi ? '✨' : ''}</div>
                  <div>{p.idade} anos</div>
                  <div>Projetos: {p.projetos.join(', ')}</div>
                  <div>
                    {p.enderecoResidencial.logradouro} — {p.enderecoResidencial.bairro}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))
        : null}
    </LayerGroup>
  )
}
