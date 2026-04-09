import { writeFileSync } from 'fs'

function createSVG(size, maskable = false) {
  const r = maskable ? 0 : size * 0.2
  const fontSize = size * 0.55
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#FC5200"/>
  <text x="${size/2}" y="${size/2 + fontSize*0.07}" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">N</text>
</svg>`
}

const configs = [
  { size: 192, name: 'icon-192.svg', maskable: false },
  { size: 512, name: 'icon-512.svg', maskable: false },
  { size: 192, name: 'icon-maskable-192.svg', maskable: true },
  { size: 512, name: 'icon-maskable-512.svg', maskable: true },
  { size: 32, name: 'favicon.svg', maskable: false },
]

for (const { size, name, maskable } of configs) {
  writeFileSync(`public/icons/${name}`, createSVG(size, maskable))
  console.log(`Created ${name}`)
}

writeFileSync('public/favicon.svg', createSVG(32, false))
console.log('Created favicon.svg')
