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

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error('status ' + res.statusCode))
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve(dest)))
    }).on('error', reject)
  })
}

async function extractCsvFromZip(zipPath) {
  const dir = await unzipper.Open.file(zipPath)
  const entry = dir.files.find((f) => /\.csv$/i.test(f.path))
  if (!entry) throw new Error('csv not found')
  const buf = await entry.buffer()
  return buf.toString('utf8')
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

async function geocodeMunicipioCentro(municipio) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(municipio + ', RJ, Brasil')}`
  const res = await fetch(url, { headers: { 'User-Agent': 'GeoIntelRJ/1.0' } })
  const data = await res.json()
  const first = data[0]
  if (!first) return null
  return [Number(first.lat), Number(first.lon)]
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
    if (!fs.existsSync(zipPath)) await download(TSE_URLS[year], zipPath)
    const csv = await extractCsvFromZip(zipPath)
    const rows = parse(csv, { columns: true, skip_empty_lines: true, delimiter: ';' })
    const rj = rows.filter((r) => (r.SG_UF || r.sg_uf) === 'RJ')
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
          try {
            latlon = await geocodeMunicipioCentro(key)
            await new Promise((res) => setTimeout(res, 1100))
            cache[key] = latlon
            saveCache(cache)
          } catch {
            latlon = [-22.9, -43.2]
          }
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

