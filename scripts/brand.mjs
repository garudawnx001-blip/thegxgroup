// Generates every brand asset from the master vector logo (public/brand/logo.svg):
// animated logo pieces, favicon/app icons, and the Open Graph share image.
import fs from 'node:fs'
import sharp from 'sharp'
const out = 'public/brand'
const src = fs.readFileSync(`${out}/logo.svg`, 'utf8')
const [W, B] = [...src.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])
const svg = (vb, body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${body}</svg>`
const white = `<path fill="#fff" d="${W}"/>`, blue = `<path fill="#087CF5" d="${B}"/>`
const P = { bar: [0, 1, 15, 366], the: [124, 0, 385, 114], 'gx-white': [105, 156, 508, 205], 'gx-blue': [481, 157, 131, 102], group: [670, 153, 949, 196], tagline: [114, 415, 1437, 64] }
const clip = (k, body) => { const [x, y, w, h] = P[k]; return svg(`${x} ${y} ${w} ${h}`, body, w, h) }
// keep only the subpaths that start inside a piece's box (keeps each piece file small)
const only = (d, k) => d; const _only = (d, k) => { const [x, y, w, h] = P[k]; return d.split(/(?=M)/).filter((sp) => { const m = sp.match(/^M\s*(-?[\d.]+)[ ,](-?[\d.]+)/); if (!m) return false; const px = +m[1], py = +m[2]; return px >= x - 6 && px <= x + w + 6 && py >= y - 6 && py <= y + h + 6 }).join('') }
for (const k of ['bar', 'the', 'group', 'gx-white']) fs.writeFileSync(`${out}/${k}.svg`, clip(k, `<path fill="#fff" d="${only(W, k)}"/>`))
fs.writeFileSync(`${out}/gx-blue.svg`, clip('gx-blue', blue))
fs.writeFileSync(`${out}/tagline.svg`, clip('tagline', `<path fill="#fff" d="${only(W, 'tagline')}"/><path fill="#087CF5" d="${only(B, 'tagline')}"/>`))
fs.writeFileSync(`${out}/gx-outline.svg`, svg('105 156 508 205', `<path fill="none" stroke="#087CF5" stroke-width="2" d="${only(W, 'gx-white')} ${only(B, 'gx-white')}"/>`, 508, 205))
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="69 -26.5 580 580" width="512" height="512"><rect x="69" y="-26.5" width="580" height="580" rx="96" fill="#07080A"/><svg x="105" y="156" width="508" height="205" viewBox="105 156 508 205">${white}${blue}</svg></svg>`
fs.writeFileSync(`${out}/mark.svg`, mark)
const m = Buffer.from(mark)
await sharp(m).resize(512, 512).png({ palette: true }).toFile(`${out}/icon-512.png`)
await sharp(m).resize(180, 180).png().toFile(`${out}/apple-touch-icon.png`)
await sharp(m).resize(48, 48).png().toFile(`${out}/favicon.png`)
await sharp(Buffer.from(src)).resize(600).png({ palette: true }).toFile(`${out}/logo-900.png`)
let grid = ''; for (let x = 0; x <= 1200; x += 48) grid += `<path d="M${x} 0V630" stroke="#14161a"/>`; for (let y = 0; y <= 630; y += 48) grid += `<path d="M0 ${y}H1200" stroke="#14161a"/>`
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#07080A"/>${grid}<path d="M980 0H1120L760 630H620Z" fill="#087CF5" fill-opacity=".16"/><svg x="190" y="157" width="820" height="243" viewBox="0 0 1619 479">${white}${blue}</svg></svg>`
await sharp(Buffer.from(og)).jpeg({ quality: 72, mozjpeg: true }).toFile(`${out}/og.jpg`)
console.log('brand assets generated')
