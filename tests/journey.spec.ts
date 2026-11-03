import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
const titles = ['Hacer una comprobación básica', 'Buscar información del modelo', 'Pedir orientación', 'Contactar a un técnico']
async function answer(page: Page, choices = ['Sí', 'No', 'No']) {
  for (let i = 0; i < 3; i++) await page.locator('fieldset').nth(i).getByRole('radio', { name: choices[i], exact: true }).check()
}
async function options(page: Page, choices?: string[]) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await answer(page, choices)
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Antes de intervenir' })).toBeVisible()
  await page.getByRole('button', { name: 'Ver mis opciones' }).click()
}
for (const [index, title] of titles.entries()) {
  test(`Recorrido mobile completo: ${title}`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await options(page)
    if (index === 0) await page.screenshot({ path: testInfo.outputPath('opciones.png'), fullPage: true })
    await expect(page.locator('.recommendation')).toContainText('podés comenzar por una comprobación básica')
    await page.getByRole('button', { name: title, exact: false }).click()
    await expect(page.getByRole('heading', { name: 'Compará antes de decidir' })).toBeVisible()
    await expect(page.locator('dt')).toHaveCount(5)
    await page.screenshot({ path: testInfo.outputPath('detalle.png'), fullPage: true })
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    await expect(page.getByRole('heading', { name: 'Tu próximo paso' })).toBeVisible()
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '7')
    await page.screenshot({ path: testInfo.outputPath('final.png'), fullPage: true })
    if (index === 0) {
      await page.getByRole('button', { name: 'Comenzar comprobación' }).click()
      await expect(page.getByRole('status')).toContainText('sin mover el equipo')
      await page.getByRole('button', { name: 'Prefiero pedir orientación' }).click()
      await expect(page.getByRole('heading', { name: 'Compará antes de decidir' })).toBeVisible()
      await page.getByRole('button', { name: 'Elegir este paso' }).click()
      await page.getByLabel('Contá qué acciones').fill('No hice comprobaciones.')
    } else if (index === 1) {
      await expect(page.locator('.box')).toContainText('la garantía')
      await expect(page.locator('.box')).toContainText('sin mover ni desarmar')
    } else if (index === 2) {
      await page.getByLabel('Contá qué acciones').fill('No hice comprobaciones.')
      await expect(page.locator('.prepared')).toContainText('El lavarropas termina el ciclo')
    } else {
      await expect(page.locator('.prepared')).toContainText('Causa desconocida.')
      await expect(page.locator('.prepared')).toContainText('No muestra un código de error.')
    }
    await page.getByRole('button', { name: '← Atrás' }).click()
    await expect(page.getByRole('heading', { name: 'Compará antes de decidir' })).toBeVisible()
    await page.getByRole('button', { name: 'Ver otras alternativas' }).click()
    await page.getByRole('button', { name: titles[(index + 1) % 4], exact: false }).click()
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    await expect(page.getByRole('heading', { name: titles[(index + 1) % 4], exact: true })).toBeVisible()
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390)
    expect(errors).toEqual([])
  })
}
test('Campos editables, adjunto simulado y estado al volver y recargar', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Descripción del problema').fill('')
  await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toBeDisabled()
  const description = 'Mi lavarropas termina el ciclo pero queda agua en el tambor.'
  await page.getByLabel('Descripción del problema').fill(description)
  await page.getByRole('button', { name: 'Agregar foto o video' }).click()
  await expect(page.getByRole('status')).toContainText('Adjunto simulado')
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toBeDisabled()
  await answer(page, ['No sé','No sé','No sé'])
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await expect(page.locator('.box')).toContainText(description)
  await expect(page.locator('.box')).toContainText('no sabés')
  await page.getByRole('button', { name: 'Corregir información' }).click()
  for (const field of await page.locator('fieldset').all()) await expect(field.getByRole('radio', {name:'No sé', exact:true})).toBeChecked()
  await page.getByRole('button', { name: 'Atrás', exact: true }).click()
  await expect(page.getByLabel('Descripción del problema')).toHaveValue(description)
  await page.reload()
  await expect(page.getByLabel('Descripción del problema')).toHaveValue(description)
  await expect(page.getByRole('button', { name: 'Quitar foto o video' })).toBeVisible()
  await page.getByRole('button', { name: 'Quitar foto o video' }).click()
  await expect(page.getByRole('status')).toHaveCount(0)
})
for (const scenario of [
  { choices: ['Sí','Sí','No'], expected: 'buscar información del modelo' },
  { choices: ['Sí','No','Sí'], expected: 'contactar a un técnico' },
  { choices: ['No sé','No sé','No sé'], expected: 'pedir orientación' },
  { choices: ['No','No','No'], expected: 'pedir orientación' },
]) test(`Recomendación contextual ${scenario.choices.join('/')}`, async ({ page }) => {
  await options(page, scenario.choices)
  await expect(page.locator('.recommendation')).toContainText(scenario.expected)
  await page.getByRole('button', {name: 'Contactar a un técnico', exact:false}).click()
  await page.getByRole('button', {name:'Elegir este paso'}).click()
  await expect(page.locator('.prepared')).toContainText(scenario.choices[0] === 'Sí' ? 'Finalizó' : scenario.choices[0] === 'No' ? 'No finalizó' : 'No sabés si el ciclo')
})
test('Sin desborde horizontal en mobile pequeño y escritorio', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({width, height:844})
    await options(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('button', { name: 'Pedir orientación', exact:false }).click()
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.evaluate(() => sessionStorage.clear())
  }
})
