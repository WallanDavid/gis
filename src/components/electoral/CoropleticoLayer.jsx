import { GeoJSON, Tooltip } from 'react-leaflet'
import bairros from '../../data/geo/bairrosRJ.json'
import { scaleSequential } from '../../utils/coresEleitorais'

export default function CoropleticoLayer({ cor, porBairro, opacity }) {
  const max = Object.values(porBairro).reduce((a, b) => Math.max(a, b), 0)
  const style = (feature) => {
    const m = feature.properties.municipio
    const b = feature.properties.bairro
    const key = `${m}|${b}`
    const v = porBairro[key] || 0
    const fillColor = scaleSequential(v, max, cor)
    return { color: '#ffffff', weight: 1, fillColor, fillOpacity: opacity }
  }
  const onEachFeature = (feature, layer) => {
    const m = feature.properties.municipio
    const b = feature.properties.bairro
    const key = `${m}|${b}`
    const v = porBairro[key] || 0
    layer.bindTooltip(`${b} • ${v} votos`)
  }
  return <GeoJSON data={bairros} style={style} onEachFeature={onEachFeature} />
}
