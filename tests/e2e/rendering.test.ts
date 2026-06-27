import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import puppeteer, { type Browser, type Page } from 'puppeteer'
import { createServer, type ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

describe('Mirror component rendering', () => {
  let browser: Browser
  let page: Page
  let server: ViteDevServer
  let baseUrl: string

  beforeAll(async () => {
    server = await createServer({
      plugins: [vue()],
      root: resolve(__dirname),
      logLevel: 'silent',
      server: { port: 0 },
    })
    await server.listen()
    const address = server.httpServer!.address()
    const port = typeof address === 'object' ? address!.port : address
    baseUrl = `http://localhost:${port}`

    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
  }, 30_000)

  afterAll(async () => {
    await browser?.close()
    await server?.close()
  }, 30_000)

  it('mounts the test app without errors', async () => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    expect(errors).toHaveLength(0)
  })

  it('renders the document root as article.mirror-doc', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const doc = await page.$('article.mirror-doc')
    expect(doc).not.toBeNull()
  })

  it('renders clause sections with headings', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const headings = await page.$$eval('.mirror-section.mirror-clause h2', els =>
      els.map(e => e.textContent?.trim().replace(/ /g, ' ')),
    )
    expect(headings).toContain('1 Scope')
    expect(headings).toContain('2 Terms and definitions')
  })

  it('renders paragraphs with text content', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const paragraphs = await page.$$eval('.mirror-paragraph', els =>
      els.map(e => e.textContent?.trim()),
    )
    expect(paragraphs.length).toBeGreaterThanOrEqual(3)
    expect(paragraphs[0]).toContain('metrological requirements')
  })

  it('renders strong marks as <strong>', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const strongText = await page.$eval('.mirror-paragraph strong', el => el.textContent)
    expect(strongText).toBe('metrological requirements')
  })

  it('renders notes with label', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const label = await page.$eval('.mirror-note .mirror-note-label', el => el.textContent)
    expect(label).toBe('Note')
  })

  it('renders definition lists', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const terms = await page.$$eval('.mirror-dt', els => els.map(e => e.textContent?.trim()))
    expect(terms).toContain('maximum permissible error')
  })

  it('renders tables with headers and rows', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const title = await page.$eval('.mirror-table-title', el => el.textContent?.trim())
    expect(title).toContain('Table 1')
    const rows = await page.$$eval('.mirror-table tbody tr', els => els.length)
    expect(rows).toBe(2)
  })

  it('renders subscript and superscript marks', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const subs = await page.$eval('sub', el => el.textContent)
    expect(subs).toBe('2')
    const sups = await page.$eval('sup.mirror-footnote', el => el.textContent)
    expect(sups).toBe('1')
  })

  it('renders links and xrefs as anchor tags', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const links = await page.$$eval('a', els =>
      els.map(e => ({ text: e.textContent?.trim(), href: e.getAttribute('href') })),
    )
    const linkHref = links.find(l => l.href === 'https://example.com')
    expect(linkHref?.text).toBe('a link')
    const xrefHref = links.find(l => l.href === '#tables')
    expect(xrefHref?.text).toBe('§3.2')
  })

  it('renders stem marks', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const stem = await page.$eval('.mirror-stem', el => el.textContent)
    expect(stem).toBe('MPE')
  })

  it('renders pre-computed formula via the formula accessor', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    const formula = await page.$('#tables .mirror-formula .mirror-formula-content math')
    expect(formula).not.toBeNull()
    const math = await page.$eval('#tables .mirror-formula .mirror-formula-content math', el => el.outerHTML)
    expect(math).toContain('<mi>MPE</mi>')
    const number = await page.$eval('#tables .mirror-formula-number', el => el.textContent?.trim())
    expect(number).toBe('(1)')
  })

  it('converts asciimath formulas to MathML', async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle0' })
    await page.waitForFunction(
      () => document.querySelectorAll('#tables .mirror-formula-content math').length >= 2,
      { timeout: 10_000 },
    )
    const formulas = await page.$$eval('#tables .mirror-formula', els =>
      els.map(e => e.querySelector('.mirror-formula-content math')?.outerHTML ?? '')
    )
    expect(formulas.length).toBe(2)
    expect(formulas[0]).toContain('<mi>MPE</mi>')
    expect(formulas[1]).toMatch(/<math[\s>]/)
  })
})
