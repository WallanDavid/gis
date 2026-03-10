import { useEffect, useState } from 'react'

export function useCandidatos() {
  const [cands, setCands] = useState([])
  useEffect(() => {
    let ok = true
    ;(async () => {
      try {
        const mod = await import('../data/eleicoesReais.js')
        if (ok) setCands(mod.candidatos || [])
      } catch {
        const mod = await import('../data/eleicoesMock.js')
        if (ok) setCands(mod.candidatos || [])
      }
    })()
    return () => {
      ok = false
    }
  }, [])
  return cands
}

