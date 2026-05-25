import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights'
const MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
]

const dest = join(__dirname, 'public', 'models')
mkdirSync(dest, { recursive: true })

async function download(file) {
  const url = `${BASE}/${file}`
  const out = join(dest, file)
  console.log(`Descargando ${file}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${file}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(out, buffer)
}

try {
  await Promise.all(MODELS.map(download))
  console.log(`Modelos descargados en: ${dest}`)
} catch (err) {
  console.error('Error descargando modelos:', err.message)
  process.exit(1)
}
