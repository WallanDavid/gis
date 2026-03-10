import { GeoJSON, Tooltip } from 'react-leaflet'
import bairros from '../../data/geo/bairrosRJ.json'
import { scaleSequential } from '../../utils/coresEleitorais'

export default function CoropleticoLayer({ cor, porBairro }) {
  const max = Object.values(porBairro).reduce((a, b) => Math.max(a, b), 0)
  const style = (feature) => {
    const m = feature.properties.municipio
    const b = feature.properties.bairro
    const key = `${m}|${b}`
    const v = porBairro[key] || 0
    const fillColor = scaleSequential(v, max, cor)
    const intensidade = max ? Math.min(0.8, v / max) : 0.2
    return {
      fillColor,
      fillOpacity: 0.12 + intensidade * 0.13,
      weight: 0.2,
      color: '#cbd5e1',
      opacity: 0.3,
      smoothFactor: 2,
      dashArray: null,
      lineCap: 'round',
      lineJoin: 'round',
    }
  }
  const onEachFeature = (feature, layer) => {
    const m = feature.properties.municipio
    const b = feature.properties.bairro
    const key = `${m}|${b}`
    const v = porBairro[key] || 0
    const intensidade = max ? Math.min(0.8, v / max) : 0.2
    const baseStyle = style(feature)
    layer.bindTooltip(`${b} • ${v} votos`)
    layer.on('mouseover', () => {
      layer.setStyle({
        fillOpacity: 0.3,
        weight: 0.5,
        color: '#64748b',
      })
      if (layer.bringToFront) layer.bringToFront()
    })
    layer.on('mouseout', () => {
      layer.setStyle({
        ...baseStyle,
        fillOpacity: 0.12 + intensidade * 0.13,
        weight: 0.2,
        color: '#cbd5e1',
      })
    })
  }
  return <GeoJSON data={bairros} style={style} onEachFeature={onEachFeature} />
}
