import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import InfoTooltip from './InfoTooltip'
import { Camera, FileText, Map as MapIcon, BarChart as BarIcon, Users, Lightbulb, Share2, Copy, Download, Code, Globe } from 'lucide-react'

export default function Sidebar({
  projects,
  selectedProject,
  onSelectProject,
  showAddresses,
  onToggleAddresses,
  candidates,
  years,
  selectedCandidate,
  selectedYear,
  onSelectCandidate,
  onSelectYear,
  compare,
  onToggleCompare,
  voteThreshold,
  onChangeVoteThreshold,
  measureMode,
  onToggleMeasure,
  votesData,
  compareData,
  // WMS
  wmsEnabled,
  wmsUrl,
  wmsLayers,
  wmsOpacity,
  onToggleWms,
  onChangeWmsUrl,
  onChangeWmsLayers,
  onChangeWmsOpacity,
  onApplyWms,
  onFillWmsExample,
  // GeoJSON externo
  geoJsonUrl,
  onChangeGeoJsonUrl,
  onLoadGeoJson,
  // Descoberta de camadas
  onDiscoverLayers,
  discoveredLayers,
  onSelectDiscoveredLayer,
  wmsError,
  projectsAvailable = [],
  selectedProjectIds = [],
  onToggleProjectId = () => {},
  projectsVisMode = 'nucleos',
  onChangeProjectsVisMode = () => {},
  onApplyProjectsFilter = () => {},
  onClearProjectsFilter = () => {},
  // Eleitoral
  electoralCandidates = [],
  electoralCandidateId = '',
  onChangeElectoralCandidate = () => {},
  electoralYearMode = '2024',
  onChangeElectoralYearMode = () => {},
  electoralVisMode = 'choropleth',
  onChangeElectoralVisMode = () => {},
  electoralOpacity = 0.4,
  onChangeElectoralOpacity = () => {},
  municipalities = [],
  selectedMunicipality = '',
  onChangeMunicipality = () => {},
  // Exportação
  incluirMapa = true,
  incluirGraficos = true,
  incluirProjetos = true,
  incluirInsights = true,
  onChangeIncluirMapa = () => {},
  onChangeIncluirGraficos = () => {},
  onChangeIncluirProjetos = () => {},
  onChangeIncluirInsights = () => {},
  onExportPng = () => {},
  onGeneratePdf = () => {},
  shareUrl = '',
  onGenerateShare = () => {},
  onCopyShare = () => {},
  onExportCsv = () => {},
  onExportGeoJson = () => {},
  onExportJson = () => {},
  onExportKml = () => {},
  gerandoPDF = false,
  progressoPDF = 0,
}) {
  const thresholds = useMemo(() => [0, 100, 500, 1000, 5000, 10000], [])
  const chartData = useMemo(() => {
    if (!votesData) return []
    if (!compareData) return votesData
    return votesData.map((d) => ({ ...d, delta: compareData[d.m] || 0 }))
  }, [votesData, compareData])
  return (
    <div className="w-full h-full flex flex-col border-l border-slate-200 bg-white">
      <div className="p-3 border-b text-slate-700 font-semibold">Ferramentas</div>
      <div className="p-3 overflow-auto">
        <Tabs defaultValue="eleitoral" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="eleitoral" className="text-xs">🗳️ Eleitoral</TabsTrigger>
            <TabsTrigger value="projetos" className="text-xs">👥 Projetos</TabsTrigger>
            <TabsTrigger value="wms" className="text-xs">🗺️ WMS</TabsTrigger>
            <TabsTrigger value="exportar" className="text-xs">📤 Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="eleitoral" className="space-y-4">
            <div>
              <div className="text-xs uppercase text-slate-500">Eleições</div>
              <select
                className="mt-1 w-full border rounded p-2"
                value={selectedCandidate || ''}
                onChange={(e) => onSelectCandidate(e.target.value || null)}
              >
                <option value="">Candidato</option>
                {candidates.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                className="mt-2 w-full border rounded p-2"
                value={selectedYear || ''}
                onChange={(e) => onSelectYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={compare} onChange={(e) => onToggleCompare(e.target.checked)} />
                Comparar 2022 vs 2024
              </label>
              <div className="mt-3 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="m" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey={compare ? 'delta' : 'v'} fill={compare ? '#10b981' : '#7c3aed'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Análise Eleitoral</div>
              <select
                className="mt-1 w-full border rounded p-2"
                value={electoralCandidateId || ''}
                onChange={(e) => onChangeElectoralCandidate(e.target.value || null)}
              >
                <option value="">Candidato</option>
                {electoralCandidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <button className={`border rounded p-2 ${electoralYearMode==='2022'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeElectoralYearMode('2022')}>2022</button>
                <button className={`border rounded p-2 ${electoralYearMode==='2024'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeElectoralYearMode('2024')}>2024</button>
                <button className={`border rounded p-2 ${electoralYearMode==='comparar'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeElectoralYearMode('comparar')}>Comparar</button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <button className={`border rounded p-2 ${electoralVisMode==='choropleth'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeElectoralVisMode('choropleth')}>Coroplético</button>
                <button className={`border rounded p-2 ${electoralVisMode==='points'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeElectoralVisMode('points')}>Pontos</button>
                <button className={`border rounded p-2 ${electoralVisMode==='heat'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeElectoralVisMode('heat')}>Calor</button>
              </div>
              <div className="mt-2">
                <div className="text-xs text-slate-600">Opacidade: {Math.round(electoralOpacity * 100)}%</div>
                <input type="range" min={0} max={1} step={0.05} value={electoralOpacity} onChange={(e) => onChangeElectoralOpacity(Number(e.target.value))} className="w-full" />
              </div>
              <select
                className="mt-2 w-full border rounded p-2"
                value={selectedMunicipality || ''}
                onChange={(e) => onChangeMunicipality(e.target.value || null)}
              >
                <option value="">Todos os municípios</option>
                {municipalities.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </TabsContent>

          <TabsContent value="projetos" className="space-y-4">
            <div>
              <div className="text-xs uppercase text-slate-500">Projetos</div>
              <select
                className="mt-1 w-full border rounded p-2"
                value={selectedProject || ''}
                onChange={(e) => onSelectProject(e.target.value || null)}
              >
                <option value="">Selecionar</option>
                {projects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={showAddresses} onChange={(e) => onToggleAddresses(e.target.checked)} />
                Mostrar endereço das pessoas que participaram
              </label>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Projetos Sociais</div>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {projectsAvailable.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedProjectIds.includes(p.id)} onChange={() => onToggleProjectId(p.id)} />
                    <span className="inline-block w-3 h-3 rounded" style={{ background: p.cor }} />
                    {p.nome}
                  </label>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <button className={`border rounded p-2 ${projectsVisMode==='nucleos'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeProjectsVisMode('nucleos')}>Núcleos</button>
                <button className={`border rounded p-2 ${projectsVisMode==='participantes'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeProjectsVisMode('participantes')}>Participantes</button>
                <button className={`border rounded p-2 ${projectsVisMode==='ambos'?'bg-slate-800 text-white':'bg-white'}`} onClick={() => onChangeProjectsVisMode('ambos')}>Ambos</button>
              </div>
              <div className="mt-4 border-t pt-3">
                <div className="font-medium mb-2 text-sm flex items-center gap-1">
                  Cruzamento Inteligente
                  <InfoTooltip content="Filtra núcleos baseado no desempenho eleitoral do candidato selecionado">
                    <span className="text-gray-500 cursor-help">ⓘ</span>
                  </InfoTooltip>
                </div>
                <div className="text-xs text-slate-600 mb-2">Filtrar núcleos por desempenho eleitoral</div>
                <div className="grid grid-cols-2 gap-2">
                  <select className="border rounded p-2" onChange={(e) => (window.__candSel = e.target.value)}>
                    <option value="">Candidato</option>
                    {candidates.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select className="border rounded p-2" onChange={(e) => (window.__opSel = e.target.value)}>
                    <option value=">">{'>'}</option>
                    <option value=">=">{'>='}</option>
                    <option value="<">{'<'}</option>
                    <option value="entre">entre</option>
                  </select>
                  <input className="border rounded p-2" type="number" placeholder="votos" onChange={(e) => (window.__vMin = Number(e.target.value))} />
                  <input className="border rounded p-2" type="number" placeholder="e (opcional)" onChange={(e) => (window.__vMax = Number(e.target.value))} />
                  <select className="border rounded p-2" onChange={(e) => (window.__anoSel = Number(e.target.value))}>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button
                    className="border rounded p-2"
                    onClick={() =>
                      onApplyProjectsFilter({
                        candidateId: window.__candSel || null,
                        operator: window.__opSel || '>=',
                        valueMin: Number(window.__vMin || 0),
                        valueMax: Number(window.__vMax || 0),
                        year: Number(window.__anoSel) || 2024,
                      })
                    }
                  >
                    Filtrar Núcleos
                  </button>
                </div>
                <button className="mt-2 w-full text-sm text-slate-700 underline" onClick={onClearProjectsFilter}>
                  Limpar filtro
                </button>
                <div className="mt-2 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2">
                  Pessoas em múltiplos projetos aparecem com destaque ✨
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Filtro Inteligente</div>
              <div className="text-xs text-slate-600">Núcleos em municípios com votos do candidato acima de:</div>
              <select className="mt-1 w-full border rounded p-2" value={voteThreshold} onChange={(e) => onChangeVoteThreshold(Number(e.target.value))}>
                {thresholds.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </TabsContent>

          <TabsContent value="wms" className="space-y-4">
            <div>
              <div className="text-xs uppercase text-slate-500">Camadas Externas (WMS / GeoJSON)</div>
              <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={wmsEnabled} onChange={(e) => onToggleWms(e.target.checked)} />
                Ativar WMS
              </label>
              <input className="mt-2 w-full border rounded p-2" placeholder="WMS URL" value={wmsUrl} onChange={(e) => onChangeWmsUrl(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <input className="flex-1 border rounded p-2" placeholder="Layers (ex.: 0 ou layer_name)" value={wmsLayers} onChange={(e) => onChangeWmsLayers(e.target.value)} />
                <button className="whitespace-nowrap bg-slate-200 text-slate-800 rounded px-3" onClick={onDiscoverLayers}>Descobrir</button>
              </div>
              {Array.isArray(discoveredLayers) && discoveredLayers.length > 0 ? (
                <select className="mt-2 w-full border rounded p-2" onChange={(e) => onSelectDiscoveredLayer(e.target.value)}>
                  <option>Selecionar camada do GetCapabilities</option>
                  {discoveredLayers.map((l) => (
                    <option key={l.name} value={l.name}>{l.title || l.name}</option>
                  ))}
                </select>
              ) : null}
              <div className="mt-2">
                <div className="text-xs text-slate-600">Opacidade: {Math.round(wmsOpacity * 100)}%</div>
                <input type="range" min={0} max={1} step={0.05} value={wmsOpacity} onChange={(e) => onChangeWmsOpacity(Number(e.target.value))} className="w-full" />
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-slate-800 text-white rounded p-2" onClick={onApplyWms}>Aplicar WMS</button>
                <button className="flex-1 bg-slate-200 text-slate-800 rounded p-2" onClick={onFillWmsExample}>Exemplo</button>
              </div>
              {wmsError ? <div className="mt-2 text-xs text-red-600">{wmsError}</div> : null}
            </div>
            <div>
              <input className="w-full border rounded p-2" placeholder="GeoJSON URL (municípios/bairros)" value={geoJsonUrl} onChange={(e) => onChangeGeoJsonUrl(e.target.value)} />
              <button className="mt-2 w-full bg-slate-800 text-white rounded p-2" onClick={onLoadGeoJson}>Carregar GeoJSON</button>
            </div>
          </TabsContent>

          <TabsContent value="exportar" className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-blue-500" />
                <div className="font-medium text-slate-700">Snapshot do Mapa</div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded px-4 py-2 flex items-center justify-center gap-2" onClick={onExportPng}>
                <Camera className="w-4 h-4" />
                Exportar como PNG
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-purple-500" />
                <div className="font-medium text-slate-700">Relatório Executivo</div>
              </div>
              <div className="space-y-2 mb-3">
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <MapIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 flex-1">Incluir snapshot do mapa</span>
                  <input type="checkbox" className="rounded border-slate-300 text-blue-500" checked={incluirMapa} onChange={(e)=>onChangeIncluirMapa(e.target.checked)} />
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <BarIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 flex-1">Incluir gráficos eleitorais</span>
                  <input type="checkbox" className="rounded border-slate-300 text-blue-500" checked={incluirGraficos} onChange={(e)=>onChangeIncluirGraficos(e.target.checked)} />
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 flex-1">Incluir lista de projetos</span>
                  <input type="checkbox" className="rounded border-slate-300 text-blue-500" checked={incluirProjetos} onChange={(e)=>onChangeIncluirProjetos(e.target.checked)} />
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <Lightbulb className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 flex-1">Incluir insights automáticos</span>
                  <input type="checkbox" className="rounded border-slate-300 text-blue-500" checked={incluirInsights} onChange={(e)=>onChangeIncluirInsights(e.target.checked)} />
                </label>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded px-4 py-2 flex items-center justify-center gap-2" onClick={onGeneratePdf}>
                <FileText className="w-4 h-4" />
                Gerar Relatório PDF
              </button>
              {typeof progressoPDF === 'number' && gerandoPDF ? (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-blue-600 rounded transition-all" style={{ width: `${progressoPDF}%` }} /></div>
                  <div className="text-xs text-slate-600 mt-1">Gerando PDF... {progressoPDF}%</div>
                </div>
              ) : null}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-green-500" />
                <div className="font-medium text-slate-700">Compartilhar Análise</div>
              </div>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={shareUrl} readOnly placeholder="Clique em gerar link" />
                <button className="bg-slate-900 hover:bg-slate-800 text-white border-0 rounded px-3" onClick={onGenerateShare}>Gerar</button>
              </div>
              <button className="w-full border border-slate-200 rounded p-2 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2" onClick={onCopyShare}>
                <Copy className="w-4 h-4" />
                Copiar link
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-5 h-5 text-amber-500" />
                <div className="font-medium text-slate-700">Exportar Dados</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="border border-slate-200 rounded p-2 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2 text-sm" onClick={onExportCsv}><FileText className="w-4 h-4" />CSV</button>
                <button className="border border-slate-200 rounded p-2 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2 text-sm" onClick={onExportGeoJson}><MapIcon className="w-4 h-4" />GeoJSON</button>
                <button className="border border-slate-200 rounded p-2 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2 text-sm" onClick={onExportJson}><Code className="w-4 h-4" />JSON</button>
                <button className="border border-slate-200 rounded p-2 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2 text-sm" onClick={onExportKml}><Globe className="w-4 h-4" />KML</button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={measureMode} onChange={(e) => onToggleMeasure(e.target.checked)} />
              Medir distâncias
            </label>
            <div className="text-xs text-slate-500">Base: OpenStreetMap. Integração com Armazém Virtual via WMS disponível.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
