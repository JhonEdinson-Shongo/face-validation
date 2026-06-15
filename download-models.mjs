import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1'
const FILES = ['face_landmarker.task']

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
  await Promise.all(FILES.map(download))
  console.log(`Modelos descargados en: ${dest}`)
} catch (err) {
  console.error('Error descargando modelos:', err.message)
  process.exit(1)
}
