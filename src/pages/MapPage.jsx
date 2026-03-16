import { useEffect, useMemo, useRef, useState, startTransition } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, CircleMarker, GeoJSON, Polyline, WMSTileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/useAuth'
import municipios from '../data/municipios.json'
import { wmsPresets } from '../data/wmsPresets'
import { useCandidatos } from '../hooks/useCandidatos'
import ElectoralLayer from '../components/electoral/ElectoralLayer'
import { projetos } from '../data/projetosMock'
import { useProjetos } from '../hooks/useProjetos'
import ProjetosLayer from '../components/projetos/ProjetosLayer'
import Papa from 'papaparse'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { gerarRelatorioPDF } from '../utils/relatorioPDF'
import { toast } from 'react-hot-toast'
import { useReabilita60 } from '../hooks/useReabilita60'
import { Reabilita60Layer } from '../components/Map/Reabilita60Layer'
 

const centerRJ = [-22.9, -43.2]

function colorScale(v, max) {
  if (max <= 0) return 'hsl(205 60% 92%)'
  const t = Math.max(0, Math.min(1, v / max))
  const light = 88 - Math.round(t * 48)
  return `hsl(205 70% ${light}%)`
}

function divergingColor(delta) {
  const m = 3000
  const t = Math.max(-m, Math.min(m, delta))
  if (t >= 0) {
    const v = Math.floor((t / m) * 255)
    return `rgb(${40},${120 + v},${60})`
  } else {
    const v = Math.floor((Math.abs(t) / m) * 255)
    return `rgb(${180 + v},${60},${60})`
  }
}

export default function MapPage() {
  const { user, logout } = useAuth()
  const mapRef = useRef(null)
  const candidatos = useCandidatos()
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAddresses, setShowAddresses] = useState(false)
  const [elections, setElections] = useState({ 2022: [], 2024: [] })
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedYear, setSelectedYear] = useState(2024)
  const [compare, setCompare] = useState(false)
  const [voteThreshold, setVoteThreshold] = useState(0)
  const [measureMode, setMeasureMode] = useState(false)
  const [measurePoints, setMeasurePoints] = useState([])
  const [wmsEnabled, setWmsEnabled] = useState(false)
  const [wmsUrl, setWmsUrl] = useState('')
  const [wmsLayers, setWmsLayers] = useState('')
  const [wmsOpacity, setWmsOpacity] = useState(0.4)
  const [geoJsonUrl, setGeoJsonUrl] = useState('')
  const [customGeoJson, setCustomGeoJson] = useState(null)
  const [discoveredLayers, setDiscoveredLayers] = useState([])
  const [wmsError, setWmsError] = useState('')
  const [electoralCandidateId, setElectoralCandidateId] = useState('')
  const [electoralYearMode, setElectoralYearMode] = useState('2024')
  const [electoralVisMode, setElectoralVisMode] = useState('choropleth')
  const [electoralOpacity, setElectoralOpacity] = useState(0.4)
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [selectedProjectIds, setSelectedProjectIds] = useState([])
  const [projectsVisMode, setProjectsVisMode] = useState('nucleos')
  const [projectsFilter, setProjectsFilter] = useState({ enabled: false, candidateId: null, operator: '>=', valueMin: 0, valueMax: 0, year: 2024 })
  const [incluirMapa, setIncluirMapa] = useState(true)
  const [incluirGraficos, setIncluirGraficos] = useState(true)
  const [incluirProjetos, setIncluirProjetos] = useState(true)
  const [incluirInsights, setIncluirInsights] = useState(true)
  const [shareUrl, setShareUrl] = useState('')
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [progressoPDF, setProgressoPDF] = useState(0)
  const [loadingElections, setLoadingElections] = useState(true)

  // Projeto 60+ Data
  const { normalizedData: reabilitaRaw, inconsistencies: reabilitaInconsistencies, rjMunicipalities: reabilitaMunicipalities } = useReabilita60()
  const [reabilitaFilters, setReabilitaFilters] = useState({
    nameSearch: '',
    municipality: '',
    showOnlyMulti: false,
    enabled: true
  })

  const filteredReabilitaData = useMemo(() => {
    return reabilitaRaw.filter(person => {
      const matchName = person.nome.toLowerCase().includes(reabilitaFilters.nameSearch.toLowerCase())
      const matchMun = !reabilitaFilters.municipality || person.municipio === reabilitaFilters.municipality
      const matchMulti = !reabilitaFilters.showOnlyMulti || person.pessoa_em_multiplos_projetos
      return matchName && matchMun && matchMulti
    })
  }, [reabilitaRaw, reabilitaFilters])

  // Loader otimizado: carrega 2024 primeiro; 2022 sob demanda (comparar ou seleção)
  useEffect(() => {
    const parseCsv = (url) =>
      new Promise((resolve) => {
        let rows = []
        Papa.parse(url, {
          header: true,
          download: true,
          worker: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          fastMode: true,
          chunk: (res) => {
            rows = rows.concat(res.data || [])
          },
          complete: () => resolve(rows),
        })
      })
    const load2024 = async () => {
      try {
        setLoadingElections(true)
        const d2024Url = new URL('../data/elections2024.csv', import.meta.url).href
        const d2024 = await parseCsv(d2024Url)
        setElections((prev) => ({ ...prev, 2024: Array.isArray(d2024) ? d2024 : [] }))
        if (!selectedCandidate) {
          const cs = [...new Set((d2024 || []).map((x) => x.candidate))].filter(Boolean)
          setSelectedCandidate(cs[0] || null)
        }
      } finally {
        setLoadingElections(false)
      }
    }
    load2024()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Carrega 2022 somente quando necessário
    if ((compare || selectedYear === 2022) && !(elections[2022] && elections[2022].length)) {
      const d2022Url = new URL('../data/elections2022.csv', import.meta.url).href
      const parseCsv = (url) =>
        new Promise((resolve) => {
          let rows = []
          Papa.parse(url, {
            header: true,
            download: true,
            worker: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            fastMode: true,
            chunk: (res) => {
              rows = rows.concat(res.data || [])
            },
            complete: () => resolve(rows),
          })
        })
      ;(async () => {
        setLoadingElections(true)
        try {
          const d2022 = await parseCsv(d2022Url)
          setElections((prev) => ({ ...prev, 2022: Array.isArray(d2022) ? d2022 : [] }))
        } finally {
          setLoadingElections(false)
        }
      })()
    }
  }, [compare, selectedYear, elections])

  const projects = useMemo(() => {
    return (user?.projects || [])
  }, [user])

  const votesByMunicipio = useMemo(() => {
    const data = elections[selectedYear] || []
    const filtered = data.filter((x) => x.candidate === selectedCandidate)
    const agg = {}
    filtered.forEach((r) => {
      agg[r.municipio] = (agg[r.municipio] || 0) + (r.total_votos || 0)
    })
    return agg
  }, [elections, selectedCandidate, selectedYear])

  const deltaByMunicipio = useMemo(() => {
    if (!compare) return null
    const agg22 = {}
    const agg24 = {}
    ;(elections[2022] || [])
      .filter((x) => x.candidate === selectedCandidate)
      .forEach((r) => (agg22[r.municipio] = (agg22[r.municipio] || 0) + r.total_votos))
    ;(elections[2024] || [])
      .filter((x) => x.candidate === selectedCandidate)
      .forEach((r) => (agg24[r.municipio] = (agg24[r.municipio] || 0) + r.total_votos))
    const out = {}
    Object.keys({ ...agg22, ...agg24 }).forEach((m) => {
      out[m] = (agg24[m] || 0) - (agg22[m] || 0)
    })
    return out
  }, [compare, elections, selectedCandidate])

  const maxVotes = useMemo(() => {
    return Object.values(votesByMunicipio).reduce((a, b) => Math.max(a, b), 0)
  }, [votesByMunicipio])

  const municipalitiesLayerStyle = (feature) => {
    const name = feature.properties.name
    const v = votesByMunicipio[name] || 0
    const baseColor = compare ? divergingColor((deltaByMunicipio || {})[name] || 0) : colorScale(v, maxVotes)
    return {
      color: '#f8fafc',
      weight: 1,
      fillColor: baseColor,
      fillOpacity: selectedCandidate ? 0.2 : 0.06,
    }
  }

  const votingPoints = useMemo(() => {
    const data = elections[selectedYear] || []
    return data
      .filter((x) => x.candidate === selectedCandidate)
      .map((r, idx) => ({
        id: idx,
        name: r.local_votacao,
        lat: Number(r.lat),
        lon: Number(r.lon),
        votos: r.total_votos,
        bairro: r.bairro,
      }))
  }, [elections, selectedCandidate, selectedYear])

  const centralizarMapa = (municipio) => {
    const target = {
      'Rio de Janeiro': [-22.91, -43.2],
      'Niterói': [-22.89, -43.11],
      'Duque de Caxias': [-22.78, -43.3],
    }[municipio]
    if (target && mapRef.current) mapRef.current.setView(target, 12)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const estadoParam = params.get('estado')
    if (estadoParam) {
      try {
        const estado = JSON.parse(atob(estadoParam))
        if (estado.candidatoId) {
          startTransition(() => {
            if (estado.candidatoId) setElectoralCandidateId(estado.candidatoId)
            if (estado.ano) setElectoralYearMode(String(estado.ano))
            if (estado.modoVisualizacao) setElectoralVisMode(estado.modoVisualizacao)
            if (estado.municipioFiltro) setSelectedMunicipality(estado.municipioFiltro)
            if (Array.isArray(estado.projetosSelecionados)) setSelectedProjectIds(estado.projetosSelecionados)
            if (typeof estado.opacidade === 'number') setElectoralOpacity(estado.opacidade)
            if (estado.wmsAtivo != null) setWmsEnabled(Boolean(estado.wmsAtivo))
          })
          toast.success('🔗 Estado restaurado do link compartilhado!')
          if (estado.municipioFiltro) centralizarMapa(estado.municipioFiltro)
        }
      } catch {
        toast.error('Link inválido ou corrompido')
      }
    }
  }, [])

  const onMapClick = (e) => {
    if (!measureMode) return
    const p = [e.latlng.lat, e.latlng.lng]
    setMeasurePoints((arr) => {
      const next = [...arr, p].slice(-2)
      return next
    })
  }

  const exportarPNG = async () => {
    try {
      const mapaElement = document.querySelector('.leaflet-container')
      if (!mapaElement) {
        toast.error('Elemento do mapa não encontrado')
        return
      }
      toast.loading('Gerando snapshot...')
      const canvas = await html2canvas(mapaElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        windowWidth: mapaElement.scrollWidth,
        windowHeight: mapaElement.scrollHeight,
      })
      const link = document.createElement('a')
      link.download = `geointel-snapshot-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Snapshot salvo!')
    } catch (error) {
      console.error('Erro no snapshot:', error)
      toast.error(`Erro ao gerar snapshot: ${error.message}`)
    }
  }

  const gerarPDF = async () => {
    const node = document.getElementById('map-root')
    const candSel = (candidatos || []).find((c) => c.id === electoralCandidateId) || null
    const totalSelecionado = Object.values(votesByMunicipio || {}).reduce((a, b) => a + b, 0)
    const candidatosTotals = candSel ? [{ nome: candSel.nome, votos2022: 0, votos2024: totalSelecionado }] : []
    const dadosEleitorais = {
      candidatos: candidatosTotals,
      municipios: Object.entries(votesByMunicipio).map(([m, v]) => ({ municipio: m, totalVotos: v, votosPrimeiro: v, votosSegundo: Math.max(0, v - 100) })),
      bairrosFortes: [],
    }
    const dadosProjetos = {
      projetos: projetos.map((p) => ({
        nome: p.nome,
        nucleos: p.nucleos,
        totalParticipantes: p.nucleos.reduce((acc, n) => acc + n.pessoas.length, 0),
        municipiosCobertos: [...new Set(p.nucleos.map((n) => n.municipio))],
      })),
      nucleos: projetos.flatMap((p) => p.nucleos),
      participantes: projetos.flatMap((p) => p.nucleos.flatMap((n) => n.pessoas)),
      municipiosCobertos: [...new Set(projetos.flatMap((p) => p.nucleos.map((n) => n.municipio)))],
    }
    try {
      setGerandoPDF(true)
      setProgressoPDF(0)
      setProgressoPDF(10)
      toast.loading('Gerando PDF...', { duration: 800 })
      await gerarRelatorioPDF(node, dadosEleitorais, dadosProjetos, {
        incluirMapa, incluirGraficos, incluirProjetos, incluirInsights,
      }, user || {})
      setProgressoPDF(100)
      toast.success('PDF gerado!')
    } catch {
      toast.error('Erro ao gerar PDF')
    } finally {
      setGerandoPDF(false)
      setProgressoPDF(0)
    }
  }

  const gerarLinkCompartilhamento = () => {
    const estado = {
      candidatoId: electoralCandidateId,
      ano: electoralYearMode,
      modoVisualizacao: electoralVisMode,
      municipioFiltro: selectedMunicipality,
      projetosSelecionados: selectedProjectIds,
      opacidade: electoralOpacity,
      wmsAtivo: wmsEnabled,
    }
    const encoded = btoa(JSON.stringify(estado))
    const url = `${window.location.origin}${window.location.pathname}?estado=${encoded}`
    setShareUrl(url)
    toast.success('Link gerado')
  }

  const copiarLink = async () => {
    try {
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copiado!')
      }
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  const exportarCSV = () => {
    const rows = (projetosData?.participants || []).map((p) => ({
      id: p.id,
      nome: p.nome,
      idade: p.idade,
      projetos: p.projetos.join('|'),
      nucleo: p.nucleoNome,
      projeto: p.projetoNome,
      municipio: p.enderecoResidencial.municipio,
      bairro: p.enderecoResidencial.bairro,
      lat: p.enderecoResidencial.coordenadas[0],
      lon: p.enderecoResidencial.coordenadas[1],
    }))
    const header = Object.keys(rows[0] || {})
    const csv = [header.join(','), ...(rows || []).map((r) => header.map((h) => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    saveAs(blob, `dados.csv`)
  }

  const exportarGeoJSON = () => {
    const features = (projetosData?.participants || []).map((p) => ({
      type: 'Feature',
      properties: { id: p.id, nome: p.nome, projetos: p.projetos.join('|'), projeto: p.projetoNome, nucleo: p.nucleoNome },
      geometry: { type: 'Point', coordinates: [p.enderecoResidencial.coordenadas[1], p.enderecoResidencial.coordenadas[0]] },
    }))
    const blob = new Blob([JSON.stringify({ type: 'FeatureCollection', features })], { type: 'application/json' })
    saveAs(blob, `geojson.json`)
  }

  const exportarJSON = () => {
    const data = { nuclei: projetosData?.nuclei || [], participants: projetosData?.participants || [] }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    saveAs(blob, `dados.json`)
  }

  const exportarKML = () => {
    const placemarks = (projetosData?.participants || [])
      .map((p) => `<Placemark><name>${p.nome}</name><Point><coordinates>${p.enderecoResidencial.coordenadas[1]},${p.enderecoResidencial.coordenadas[0]}</coordinates></Point></Placemark>`)
      .join('')
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>${placemarks}</Document></kml>`
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' })
    saveAs(blob, `dados.kml`)
  }

  const measureDistanceKm = useMemo(() => {
    if (measurePoints.length < 2) return null
    const a = L.latLng(measurePoints[0][0], measurePoints[0][1])
    const b = L.latLng(measurePoints[1][0], measurePoints[1][1])
    return (a.distanceTo(b) / 1000).toFixed(2)
  }, [measurePoints])

  const onToggleMeasure = (v) => {
    setMeasureMode(v)
    if (!v) setMeasurePoints([])
  }

 

  const isValidWmsUrl = (url) => {
    if (!url) return false
    const base = url.split('?')[0].toLowerCase()
    return base.endsWith('/wmsserver')
  }

  const onApplyWms = () => {
    if (!isValidWmsUrl(wmsUrl)) {
      setWmsError('URL inválida: precisa terminar com WMSServer')
      toast.error('URL inválida do WMS')
      setWmsEnabled(false)
      return
    }
    if (!wmsLayers) {
      setWmsError('Informe a camada (Layers) ou use Descobrir para escolher')
      toast.error('Informe a camada do WMS')
      setWmsEnabled(false)
      return
    }
    setWmsError('')
    setWmsEnabled(true)
    toast.success('Camada WMS aplicada')
  }

  const onFillWmsExample = () => {
    setWmsUrl(wmsPresets.ortofoto.url)
    setWmsLayers(wmsPresets.ortofoto.layers)
    setWmsOpacity(0.35)
    setWmsEnabled(true)
  }

  const onLoadGeoJson = async () => {
    if (!geoJsonUrl) return
    try {
      const res = await fetch(geoJsonUrl)
      const data = await res.json()
      setCustomGeoJson(data)
    } catch {
      // Silencioso; em produção exibir aviso
    }
  }

  const onDiscoverLayers = async () => {
    setWmsError('')
    setDiscoveredLayers([])
    if (!isValidWmsUrl(wmsUrl)) {
      setWmsError('URL inválida: precisa terminar com WMSServer')
      return
    }
    try {
      const sep = wmsUrl.includes('?') ? '&' : '?'
      const url = `${wmsUrl}${sep}service=WMS&request=GetCapabilities`
      const res = await fetch(url)
      const text = await res.text()
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'application/xml')
      const layerNodes = Array.from(xml.getElementsByTagName('Layer'))
      const out = []
      layerNodes.forEach((n) => {
        const name = n.getElementsByTagName('Name')[0]?.textContent
        const title = n.getElementsByTagName('Title')[0]?.textContent
        if (name) out.push({ name, title })
      })
      // Remove duplicados e camadas de grupo (sem Name)
      const uniq = []
      const seen = new Set()
      out.forEach((l) => {
        if (!seen.has(l.name)) {
          seen.add(l.name)
          uniq.push(l)
        }
      })
      setDiscoveredLayers(uniq)
      if (!wmsLayers && uniq.length) setWmsLayers(uniq[0].name)
    } catch {
      setWmsError('Falha ao obter GetCapabilities. Verifique CORS ou a URL.')
    }
  }

  const onSelectDiscoveredLayer = (layerName) => {
    setWmsLayers(layerName)
  }

  const allowedProjectIds = useMemo(() => {
    const userProjects = user?.projects || []
    const allIdsByName = Object.fromEntries(projetos.map((p) => [p.nome, p.id]))
    const ids = userProjects.map((n) => allIdsByName[n]).filter(Boolean)
    return ids.length ? ids : projetos.map((p) => p.id)
  }, [user])

  const projectsElectoralVotes = useMemo(() => votesByMunicipio, [votesByMunicipio])

  const projetosData = useProjetos({
    allowedIds: allowedProjectIds,
    selectedIds: selectedProjectIds,
    visMode: projectsVisMode,
    electoralFilter: projectsFilter,
    votesByMunicipio: projectsElectoralVotes,
  })

  const focusRegionFromNucleo = (municipio) => {
    setSelectedMunicipality(municipio || '')
    setElectoralYearMode('2024')
    if (municipio) {
      const target = {
        'Rio de Janeiro': [-22.91, -43.2],
        'Niterói': [-22.89, -43.11],
        'Duque de Caxias': [-22.78, -43.30],
      }[municipio]
      if (target && mapRef.current) mapRef.current.setView(target, 12)
    }
  }

  return (
    <div className="h-screen w-screen flex">
      <div className="flex-1">
        <div id="map-root" className="h-full w-full">
          <MapContainer
            center={centerRJ}
            zoom={10}
            className="h-full w-full"
            whenCreated={(m) => (mapRef.current = m)}
            onclick={onMapClick}
          >
            {loadingElections ? (
              <div className="absolute top-3 left-3 z-[1000]">
                <div className="flex items-center gap-2 rounded bg-white/90 px-3 py-2 shadow">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  <div className="text-xs text-slate-700">Carregando dados...</div>
                </div>
              </div>
            ) : null}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {wmsEnabled ? (
              <WMSTileLayer
                url={wmsUrl}
                params={{ layers: wmsLayers, format: 'image/png', transparent: true }}
                opacity={wmsOpacity}
              />
            ) : null}
            <GeoJSON data={customGeoJson || municipios} style={municipalitiesLayerStyle} />
            {electoralYearMode !== 'comparar' ? (
              <ElectoralLayer
                candidatoId={electoralCandidateId}
                ano={electoralYearMode === '2022' ? 2022 : 2024}
                municipio={selectedMunicipality || null}
                modo={electoralVisMode}
                opacity={electoralOpacity}
              />
            ) : null}
            <ProjetosLayer
              nuclei={projetosData.nuclei}
              participants={projetosData.participants}
              visMode={projectsVisMode}
              onFocusRegion={focusRegionFromNucleo}
            />
            {reabilitaFilters.enabled && (
              <Reabilita60Layer data={filteredReabilitaData} />
            )}
            {selectedCandidate ? (
              <LayerGroup>
                {(votingPoints || []).map((v) => (
                  <Marker key={v.id} position={[v.lat, v.lon]}>
                    <Popup>
                      <div className="space-y-1">
                        <div className="font-semibold">{v.name}</div>
                        <div>{v.bairro}</div>
                        <div>Votos: {v.votos}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            ) : null}
            {measurePoints.length === 2 ? (
              <>
                <Polyline positions={measurePoints} pathOptions={{ color: '#111827' }} />
                <Marker position={measurePoints[1]}>
                  <Popup>Distância: {measureDistanceKm} km</Popup>
                </Marker>
              </>
            ) : null}
          </MapContainer>
        </div>
      </div>
      <div className="w-[26rem]">
        <div className="h-full">
          <div className="h-12 flex items-center justify-between px-3 border-b">
            <div className="font-semibold text-slate-700">GeoIntel RJ</div>
            <button
              className="text-sm text-red-600"
              onClick={() => logout()}
            >
              Sair
            </button>
          </div>
          <div className="h-[calc(100%-3rem)]">
            <Sidebar
            reabilitaFilters={reabilitaFilters}
            setReabilitaFilters={setReabilitaFilters}
            reabilitaMunicipalities={reabilitaMunicipalities}
            reabilitaInconsistenciesCount={reabilitaInconsistencies.length}
            projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              showAddresses={showAddresses}
              onToggleAddresses={setShowAddresses}
              candidates={[...new Set([...(elections[2022] || []), ...(elections[2024] || [])].map((x) => x.candidate))].filter(Boolean)}
              years={[2022, 2024]}
              selectedCandidate={selectedCandidate}
              selectedYear={selectedYear}
              onSelectCandidate={setSelectedCandidate}
              onSelectYear={setSelectedYear}
              compare={compare}
              onToggleCompare={setCompare}
              voteThreshold={voteThreshold}
              onChangeVoteThreshold={setVoteThreshold}
              measureMode={measureMode}
              onToggleMeasure={onToggleMeasure}
              votesData={Object.entries(votesByMunicipio)
                .map(([m, v]) => ({ m, v }))
                .sort((a, b) => b.v - a.v)
                .slice(0, 8)}
              compareData={deltaByMunicipio}
              wmsEnabled={wmsEnabled}
              wmsUrl={wmsUrl}
              wmsLayers={wmsLayers}
              wmsOpacity={wmsOpacity}
              onToggleWms={setWmsEnabled}
              onChangeWmsUrl={setWmsUrl}
              onChangeWmsLayers={setWmsLayers}
              onChangeWmsOpacity={setWmsOpacity}
              onApplyWms={onApplyWms}
              onFillWmsExample={onFillWmsExample}
              geoJsonUrl={geoJsonUrl}
              onChangeGeoJsonUrl={setGeoJsonUrl}
              onLoadGeoJson={onLoadGeoJson}
              onDiscoverLayers={onDiscoverLayers}
              discoveredLayers={discoveredLayers}
              onSelectDiscoveredLayer={onSelectDiscoveredLayer}
              wmsError={wmsError}
              electoralCandidates={candidatos}
              electoralCandidateId={electoralCandidateId}
              onChangeElectoralCandidate={setElectoralCandidateId}
              electoralYearMode={electoralYearMode}
              onChangeElectoralYearMode={setElectoralYearMode}
              electoralVisMode={electoralVisMode}
              onChangeElectoralVisMode={setElectoralVisMode}
              electoralOpacity={electoralOpacity}
              onChangeElectoralOpacity={setElectoralOpacity}
              municipalities={[...new Set(['Rio de Janeiro', 'Niterói', 'Duque de Caxias'])]}
              selectedMunicipality={selectedMunicipality}
              onChangeMunicipality={setSelectedMunicipality}
              projectsAvailable={projetos.filter((p) => allowedProjectIds.includes(p.id))}
              selectedProjectIds={selectedProjectIds}
              onToggleProjectId={(id) =>
                setSelectedProjectIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              projectsVisMode={projectsVisMode}
              onChangeProjectsVisMode={setProjectsVisMode}
              onApplyProjectsFilter={(cfg) => setProjectsFilter({ enabled: true, ...cfg })}
              onClearProjectsFilter={() => setProjectsFilter({ enabled: false, candidateId: null, operator: '>=', valueMin: 0, valueMax: 0, year: 2024 })}
              incluirMapa={incluirMapa}
              incluirGraficos={incluirGraficos}
              incluirProjetos={incluirProjetos}
              incluirInsights={incluirInsights}
              onChangeIncluirMapa={setIncluirMapa}
              onChangeIncluirGraficos={setIncluirGraficos}
              onChangeIncluirProjetos={setIncluirProjetos}
              onChangeIncluirInsights={setIncluirInsights}
              onExportPng={exportarPNG}
              onGeneratePdf={gerarPDF}
              shareUrl={shareUrl}
              onGenerateShare={gerarLinkCompartilhamento}
              onCopyShare={copiarLink}
              onExportCsv={exportarCSV}
              onExportGeoJson={exportarGeoJSON}
              onExportJson={exportarJSON}
              onExportKml={exportarKML}
              gerandoPDF={gerandoPDF}
              progressoPDF={progressoPDF}
            />
            <div className="absolute bottom-3 right-[28rem] bg-white/90 rounded shadow p-2 text-xs space-y-1">
              <div className="font-semibold text-slate-700">Legenda</div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: colorScale(maxVotes * 0.2, maxVotes) }} />
                Baixo
                <span className="inline-block w-3 h-3 rounded" style={{ background: colorScale(maxVotes, maxVotes) }} />
                Alto
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-slate-700" />
                Núcleos
                <span className="inline-block w-3 h-3 rounded bg-sky-500" />
                Endereços
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
