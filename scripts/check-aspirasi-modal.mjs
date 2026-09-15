import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'

const url = process.argv[2] || 'https://timmas-tracker.vercel.app/?v=check'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle' })

await page.getByRole('button', { name: /Tambah Aspirasi/i }).click()
await page.waitForTimeout(700)

const title = (await page.locator('#aspirasi-modal-title').textContent())?.trim() || ''
const hasV5 = (await page.locator('text=Layout v5').count()) > 0
const boxes = await page.evaluate(() => {
  const ids = ['asp-nama', 'asp-org', 'asp-topik', 'asp-wa', 'asp-waktu']
  return ids.map((id) => {
    const el = document.getElementById(id)
    if (!el) return { id, missing: true }
    const r = el.getBoundingClientRect()
    return {
      id,
      w: Math.round(r.width),
      top: Math.round(r.top),
      left: Math.round(r.left),
    }
  })
})

const shot = 'aspirasi-modal-check.png'
await page.screenshot({ path: shot, fullPage: false })
await browser.close()

const report = {
  url,
  title,
  hasLayoutV5Banner: hasV5,
  fields: boxes,
  stackedVertically:
    boxes.every((b) => !b.missing) &&
    boxes.every((b, i) => i === 0 || b.top > boxes[i - 1].top) &&
    boxes.every((b) => b.left === boxes[0].left),
  sameWidth:
    boxes.every((b) => !b.missing) && boxes.every((b) => b.w === boxes[0].w),
  screenshot: shot,
}

writeFileSync('aspirasi-modal-check.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
