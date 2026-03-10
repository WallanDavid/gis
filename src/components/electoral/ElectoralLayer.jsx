import CoropleticoLayer from './CoropleticoLayer'
import PontosVotacaoLayer from './PontosVotacaoLayer'
import HeatmapLayer from './HeatmapLayer'
import { candidatos } from '../../data/eleicoesMock'
import { useDadosEleitorais } from '../../hooks/useDadosEleitorais'

export default function ElectoralLayer({
  candidatoId,
  ano,
  municipio,
  modo,
  opacity,
}) {
  const cand = candidatos.find((c) => c.id === candidatoId)
  const cor = cand?.cor || '#7c3aed'
  const { porBairro, pontos } = useDadosEleitorais({ candidatoId, ano, municipio })
  if (!candidatoId) return null
  if (modo === 'points') return <PontosVotacaoLayer pontos={pontos} cor={cor} opacity={opacity} />
  if (modo === 'heat') return <HeatmapLayer pontos={pontos} cor={cor} opacity={opacity} />
  return <CoropleticoLayer porBairro={porBairro} cor={cor} opacity={opacity} />
}
