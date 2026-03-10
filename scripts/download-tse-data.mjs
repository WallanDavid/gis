import fs from 'fs'
import path from 'path'
import https from 'https'
import unzipper from 'unzipper'
import { parse } from 'csv-parse/sync'

const TSE_URLS = {
  2022: 'https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip',
  2024: 'https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2024.zip',
}

const outDir = path.resolve(process.cwd(), 'src', 'data')
const cacheDir = path.resolve(process.cwd(), '.cache')
const cachePath = path.join(cacheDir, 'geocode-cache.json')

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function download(url, dest, retries = 3) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const request = https.get(url, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        const total = Number(res.headers['content-length'] || 0)
        let downloaded = 0
        res.on('data', (chunk) => {
          downloaded += chunk.length
          if (total && downloaded % (10 * 1024 * 1024) < chunk.length) {
            const pct = ((downloaded / total) * 100).toFixed(1)
            console.log(`... ${pct}% (${(downloaded / (1024 * 1024)).toFixed(1)}MB/${(total / (1024 * 1024)).toFixed(1)}MB)`)
          }
        })
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      } else if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        download(res.headers.location, dest, retries).then(resolve).catch(reject)
      } else {
        reject(new Error(`HTTP ${res.statusCode}`))
      }
    })
    request.on('error', (err) => {
      if (retries > 0) {
        console.log(`Falha, tentando novamente... (${retries} tentativas restantes)`)
        setTimeout(() => download(url, dest, retries - 1).then(resolve).catch(reject), 5000)
      } else {
        reject(err)
      }
    })
    request.on('timeout', () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

async function processZipInChunks(zipPath, ano) {
  const directory = await unzipper.Open.file(zipPath)
  const csvFile = directory.files.find((f) => /\.csv$/i.test(f.path))
  if (!csvFile) throw new Error('CSV não encontrado no zip')
  const csvData = await csvFile.buffer()
  const records = parse(csvData.toString('latin1'), { delimiter: ';', columns: true, skip_empty_lines: true })
  const recordsRJ = records.filter((r) => (r.SG_UF || r.sg_uf) === 'RJ')
  console.log(`✅ ${recordsRJ.length} registros para o RJ (${ano})`)
  return recordsRJ
}

function slug(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function centroid(feature) {
  if (!feature || !feature.geometry) return null
  const g = feature.geometry
  const coords = []
  function collect(c) {
    if (typeof c[0] === 'number') coords.push(c)
    else c.forEach(collect)
  }
  collect(g.coordinates)
  const n = coords.length || 1
  const sum = coords.reduce((a, b) => [a[0] + b[1], a[1] + b[0]], [0, 0])
  return [sum[1] / n, sum[0] / n]
}

const geocodeCache = {}
async function geocodeMunicipio(municipio) {
  if (geocodeCache[municipio]) return geocodeCache[municipio]
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(municipio + ', RJ, Brasil')}&limit=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'GeoIntel-RJ/1.0' } })
    const arr = await res.json()
    if (Array.isArray(arr) && arr[0]) {
      const obj = { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) }
      geocodeCache[municipio] = obj
      return obj
    }
  } catch {
    console.log(`Erro ao geocodificar ${municipio}, usando fallback`)
  }
  return { lat: -22.9, lon: -43.2 }
}

async function buildCentroids() {
  const geo = JSON.parse(fs.readFileSync(path.join(outDir, 'municipios.json'), 'utf8'))
  const map = {}
  for (const f of geo.features || []) {
    const c = centroid(f)
    const n = f.properties?.name
    if (n && c) map[n] = c
  }
  return map
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(obj) {
  ensureDir(cacheDir)
  fs.writeFileSync(cachePath, JSON.stringify(obj, null, 2))
}

async function downloadAndConvert() {
  ensureDir(outDir)
  const centroids = await buildCentroids()
  const cache = loadCache()
  const eleicoes = {}
  const candidatosMap = {}
  for (const yr of Object.keys(TSE_URLS)) {
    const year = Number(yr)
    const zipPath = path.join(cacheDir, `tse_${year}.zip`)
    ensureDir(cacheDir)
    if (!fs.existsSync(zipPath)) {
      console.log(`📥 Baixando dados de ${year}... (pode levar alguns minutos)`)
      await download(TSE_URLS[year], zipPath)
    }
    const rj = await processZipInChunks(zipPath, year)
    const votos = []
    for (const r of rj) {
      const municipio = r.NM_MUNICIPIO || r.nm_municipio || r.MUNICIPIO || r.municipio
      const candidatoNome = r.NM_VOTAVEL || r.nm_votavel || r.NM_CANDIDATO || r.nm_candidato
      const votosQt = Number(r.QT_VOTOS || r.qt_votos || r.VOTOS || 0)
      const zona = r.NR_ZONA || r.nr_zona || ''
      if (!municipio || !candidatoNome || !votosQt) continue
      const candidatoId = slug(candidatoNome)
      candidatosMap[candidatoId] = { id: candidatoId, nome: candidatoNome, partido: '', cor: '#7c3aed' }
      const key = municipio
      let latlon = centroids[key]
      if (!latlon) {
        if (cache[key]) latlon = cache[key]
        else {
          const g = await geocodeMunicipio(key)
          await new Promise((res) => setTimeout(res, 1100))
          latlon = [g.lat, g.lon]
          cache[key] = latlon
          saveCache(cache)
        }
      }
      votos.push({
        municipio: municipio,
        bairro: '',
        candidatoId,
        votos: votosQt,
        local: `Zona ${zona || ''}`.trim(),
        latitude: latlon ? latlon[0] : -22.9,
        longitude: latlon ? latlon[1] : -43.2,
      })
    }
    eleicoes[year] = { votos }
  }
  const candidatos = Object.values(candidatosMap)
  const out = `export const candidatos = ${JSON.stringify(candidatos, null, 2)}\nexport const eleicoes = ${JSON.stringify(eleicoes, null, 2)}\n`
  fs.writeFileSync(path.join(outDir, 'eleicoesReais.js'), out)
}

downloadAndConvert().catch((e) => {
  process.exitCode = 1
})
