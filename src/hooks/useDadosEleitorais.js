import { useEffect, useMemo, useState } from 'react'

export function useDadosEleitorais({ candidatoId, ano, municipio }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const realPath = '../data/eleicoesReais.js'
        const mod = await import(/* @vite-ignore */ realPath)
        if (mounted) setData(mod)
      } catch {
        const mockPath = '../data/eleicoesMock.js'
        const mod = await import(/* @vite-ignore */ mockPath)
        if (mounted) setData(mod)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])
  return useMemo(() => {
    const votos = (data?.eleicoes?.[ano]?.votos || []).filter(
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
  }, [data, candidatoId, ano, municipio])
}
