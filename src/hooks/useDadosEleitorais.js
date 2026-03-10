import { useMemo } from 'react'
import { eleicoes } from '../data/eleicoesMock'

export function useDadosEleitorais({ candidatoId, ano, municipio }) {
  return useMemo(() => {
    const votos = (eleicoes[ano]?.votos || []).filter(
      (v) => (!municipio || v.municipio === municipio) && (!candidatoId || v.candidatoId === candidatoId),
    )
    const porBairro = {}
    votos.forEach((v) => {
      const key = `${v.municipio}|${v.bairro}`
      porBairro[key] = (porBairro[key] || 0) + v.votos
    })
    const pontos = votos.map((v, i) => ({
      id: `${ano}-${i}`,
      ...v,
    }))
    const total = votos.reduce((a, b) => a + b.votos, 0)
    return { porBairro, pontos, total }
  }, [candidatoId, ano, municipio])
}
