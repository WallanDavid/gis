import jsPDF from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { gerarInsights } from './geradorInsights'

export const gerarRelatorioPDF = async (mapElement, dadosEleitorais, dadosProjetos, opcoes, usuarioLogado) => {
  const doc = new jsPDF('landscape', 'mm', 'a4')
  let y = 20
  doc.setFontSize(18)
  doc.text('Relatório Executivo - GeoIntel RJ', 20, y)
  y += 10
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, y)
  y += 12
  doc.setFontSize(12)
  if (usuarioLogado) {
    doc.text(`Usuário: ${usuarioLogado.email || 'N/D'}`, 20, y)
  }
  y += 12
  if (opcoes?.incluirMapa && mapElement) {
    const canvas = await html2canvas(mapElement, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 250
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    doc.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight)
    y += imgHeight + 10
    if (y > 180) {
      doc.addPage()
      y = 20
    }
  }
  if (opcoes?.incluirGraficos && dadosEleitorais?.candidatos) {
    doc.setFontSize(14)
    doc.text('Análise Eleitoral', 20, y)
    y += 8
    const body = dadosEleitorais.candidatos.map((c) => [
      c.nome,
      (c.votos2022 || 0).toLocaleString('pt-BR'),
      (c.votos2024 || 0).toLocaleString('pt-BR'),
      c.votos2022 > 0 ? `${(((c.votos2024 || 0) - (c.votos2022 || 0)) / c.votos2022 * 100).toFixed(1)}%` : '0%',
    ])
    doc.autoTable({ startY: y, head: [['Candidato', 'Votos 2022', 'Votos 2024', 'Variação']], body, theme: 'striped' })
    y = doc.lastAutoTable.finalY + 12
  }
  if (opcoes?.incluirProjetos && dadosProjetos?.projetos) {
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(14)
    doc.text('Projetos Sociais', 20, y)
    y += 8
    const body = dadosProjetos.projetos.map((p) => [
      p.nome,
      p.nucleos.length,
      p.totalParticipantes,
      (p.municipiosCobertos || []).join(', '),
    ])
    doc.autoTable({ startY: y, head: [['Projeto', 'Núcleos', 'Participantes', 'Cobertura']], body, theme: 'striped' })
    y = doc.lastAutoTable.finalY + 12
  }
  if (opcoes?.incluirInsights) {
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(14)
    doc.text('Insights Estratégicos', 20, y)
    y += 8
    const insights = gerarInsights(dadosEleitorais, dadosProjetos)
    doc.setFontSize(11)
    insights.forEach((ins) => {
      doc.text(`• ${ins}`, 25, y)
      y += 6
      if (y > 280) {
        doc.addPage()
        y = 20
      }
    })
  }
  doc.save(`relatorio-geointel-${Date.now()}.pdf`)
}
