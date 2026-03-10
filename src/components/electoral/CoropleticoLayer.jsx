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
    return {
      fillColor,
      fillOpacity: 1,
      weight: 0.1,
      color: '#e2e8f0',
      opacity: 0.2,
      smoothFactor: 2.5,
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
    const baseStyle = style(feature)
    layer.bindTooltip(`${b} • ${v} votos`)
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 0.3,
        color: '#64748b',
        opacity: 0.4,
      })
      if (layer.bringToFront) layer.bringToFront()
    })
    layer.on('mouseout', () => {
      layer.setStyle({
        ...baseStyle,
        weight: 0.1,
        color: '#e2e8f0',
        opacity: 0.2,
      })
    })
  }
  return <GeoJSON data={bairros} style={style} onEachFeature={onEachFeature} />
}
