export const gerarInsights = (dadosEleitorais, dadosProjetos) => {
  const insights = []
  const crescimento = dadosEleitorais.candidatos.map((c) => ({
    nome: c.nome,
    crescimento: c.votos2022 > 0 ? ((c.votos2024 - c.votos2022) / c.votos2022) * 100 : 0,
  }))
  if (crescimento.length) {
    const maior = crescimento.reduce((max, c) => (c.crescimento > max.crescimento ? c : max), crescimento[0])
    insights.push(`${maior.nome} teve o maior crescimento (${maior.crescimento.toFixed(1)}%) entre 2022 e 2024.`)
  }
  const territoriosEmpate = (dadosEleitorais.municipios || []).filter(
    (m) => m.totalVotos > 0 && Math.abs(m.votosPrimeiro - m.votosSegundo) / m.totalVotos < 0.05
  )
  if (territoriosEmpate.length > 0) {
    insights.push(
      `Identificamos ${territoriosEmpate.length} territórios com empate técnico, representando oportunidades de crescimento.`
    )
  }
  const projetosEmBairrosFortes = (dadosProjetos.nucleos || []).filter((n) =>
    (dadosEleitorais.bairrosFortes || []).includes(n.bairro)
  ).length
  insights.push(`${projetosEmBairrosFortes} núcleos de projetos estão em bairros de alta votação do candidato líder.`)
  const multiplosProjetos = (dadosProjetos.participantes || []).filter((p) => (p.projetos || []).length > 1).length
  insights.push(`${multiplosProjetos} participantes estão em mais de um projeto, indicando maior engajamento.`)
  const coberturaProjetos = (dadosProjetos.municipiosCobertos || []).length
  insights.push(`Os projetos sociais cobrem ${coberturaProjetos} municípios do estado.`)
  return insights
}
