import { useMemo } from 'react'
import { projetos } from '../data/projetosMock'

export function useProjetos({ allowedIds = [], selectedIds = [], visMode = 'nucleos', electoralFilter, votesByMunicipio = {} }) {
  const data = useMemo(() => {
    const allowed = new Set(allowedIds.length ? allowedIds : projetos.map((p) => p.id))
    const selected = new Set(selectedIds.length ? selectedIds : projetos.filter((p) => allowed.has(p.id)).map((p) => p.id))
    const filtered = projetos.filter((p) => allowed.has(p.id) && selected.has(p.id))
    const peopleCount = {}
    projetos.forEach((p) =>
      p.nucleos.forEach((n) =>
        n.pessoas.forEach((pe) => {
          peopleCount[pe.id] = (peopleCount[pe.id] || 0) + 1
        }),
      ),
    )
    let nuclei = []
    let participants = []
    filtered.forEach((p) => {
      p.nucleos.forEach((n) => {
        nuclei.push({
          ...n,
          projetoId: p.id,
          projetoNome: p.nome,
          cor: p.cor,
          totalPessoas: n.pessoas.length,
        })
        n.pessoas.forEach((pe) => {
          participants.push({
            projetoId: p.id,
            projetoNome: p.nome,
            cor: p.cor,
            nucleoId: n.id,
            nucleoNome: n.nome,
            ...pe,
            multi: peopleCount[pe.id] > 1,
          })
        })
      })
    })
    if (electoralFilter && electoralFilter.enabled) {
      const { candidateId, operator, valueMin, valueMax, year } = electoralFilter
      if (candidateId && year) {
        const meets = (municipio) => {
          const v = votesByMunicipio[municipio] || 0
          if (operator === '>') return v > valueMin
          if (operator === '>=') return v >= valueMin
          if (operator === '<') return v < valueMin
          if (operator === 'entre') return v >= valueMin && v <= valueMax
          return true
        }
        nuclei = nuclei.filter((n) => meets(n.municipio))
        const allowedNucleusIds = new Set(nuclei.map((n) => n.id))
        participants = participants.filter((pe) => allowedNucleusIds.has(pe.nucleoId))
      }
    }
    return { nuclei, participants }
  }, [allowedIds, selectedIds, visMode, electoralFilter, votesByMunicipio])
  return data
}
