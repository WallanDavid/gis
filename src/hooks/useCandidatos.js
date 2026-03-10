import { useEffect, useState } from 'react'

export function useCandidatos() {
  const [cands, setCands] = useState([])
  useEffect(() => {
    let ok = true
    ;(async () => {
      try {
        const realPath = '../data/eleicoesReais.js'
        const mod = await import(/* @vite-ignore */ realPath)
        if (ok) setCands(mod.candidatos || [])
      } catch {
        const mockPath = '../data/eleicoesMock.js'
        const mod = await import(/* @vite-ignore */ mockPath)
        if (ok) setCands(mod.candidatos || [])
      }
    })()
    return () => {
      ok = false
    }
  }, [])
  return cands
}
