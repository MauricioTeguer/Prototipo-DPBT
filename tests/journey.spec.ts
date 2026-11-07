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
    await expect(page.getByText('Según la información disponible, estas son algunas formas', { exact: false })).toBeVisible()
    await expect(page.getByText('Recomendación', { exact: true })).toHaveCount(0)
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
      await expect(page.locator('.prepared')).toContainText('No apareció un código de error.')
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
  await expect(page.locator('.box').first()).toContainText(description)
  await expect(page.locator('.box').first()).toContainText('No sabés')
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
const confirmations = [
  'Elegiste hacer una comprobación básica que no requiere desarmar el lavarropas.',
  'Elegiste buscar información del modelo para consultar información específica de tu lavarropas.',
  'Elegiste pedir orientación para pensar cómo avanzar con alguien de confianza o con experiencia.',
  'Elegiste contactar a un técnico para obtener una evaluación profesional.',
]
for (const [index, title] of titles.entries()) {
  test(`Confirmación, cambio de decisión y finalización: ${title}`, async ({ page }) => {
    await options(page)
    await page.getByRole('button', { name: title, exact: false }).click()
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    await page.getByRole('button', { name: 'Definir mi próximo paso' }).click()
    await expect(page.getByRole('heading', { name: 'Ya definiste tu próximo paso' })).toBeVisible()
    await expect(page.getByText(confirmations[index], { exact: true })).toBeVisible()
    await expect(page.getByText('Podés volver y elegir otra alternativa si cambia la situación o si necesitás explorar otra forma de avanzar.')).toBeVisible()
    await page.reload()
    await expect(page.getByText(confirmations[index], { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '← Atrás' }).click()
    await expect(page.getByRole('heading', { name: 'Tu próximo paso', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Definir mi próximo paso' }).click()
    await page.getByRole('button', { name: 'Volver a las alternativas' }).click()
    await expect(page.getByRole('heading', { name: '¿Cómo podrías avanzar?' })).toBeVisible()
    // Cambiar de alternativa también debe actualizar la confirmación.
    const other = (index + 1) % titles.length
    await page.getByRole('button', { name: titles[other], exact: false }).click()
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    await page.getByRole('button', { name: 'Definir mi próximo paso' }).click()
    await expect(page.getByText(confirmations[other], { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Finalizar', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Recorrido finalizado', exact: true })).toBeVisible()
    await expect(page.getByText('Ya tenés un próximo paso definido. Si la situación cambia, podés volver a evaluar tus alternativas.')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Recorrido finalizado', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '← Atrás' }).click()
    await expect(page.getByText(confirmations[other], { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Finalizar', exact: true }).click()
    await page.getByRole('button', { name: 'Volver a las alternativas' }).click()
    await expect(page.getByRole('heading', { name: '¿Cómo podrías avanzar?' })).toBeVisible()
  })
}
test('Continuar entre alternativas conserva respuestas, descripción, adjunto y acciones', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Agregar foto o video' }).click()
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await answer(page)
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  const known = page.getByRole('heading', { name: 'Lo que sabemos', exact: true }).locator('..')
  for (const text of ['El lavarropas indicó que el ciclo terminó.', 'Quedó agua dentro del tambor.', 'No apareció un código de error.', 'No se detectaron ruidos u olores inusuales.']) await expect(known).toContainText(text)
  await expect(page.getByRole('heading', { name: 'Lo que todavía no sabemos' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await page.getByRole('button', { name: 'Ver mis opciones' }).click()
  await page.getByRole('button', { name: titles[1], exact: false }).click()
  await page.getByRole('button', { name: 'Elegir este paso' }).click()
  for (const [button, title] of [['Hacer una comprobación básica', titles[0]], ['Prefiero pedir orientación', titles[2]], ['Contactar a un técnico', titles[3]]]) {
    await page.getByRole('button', { name: button, exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Compará antes de decidir' })).toBeVisible()
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    if (title === titles[0]) await page.getByRole('button', { name: 'Comenzar comprobación' }).click()
    if (title === titles[2]) await page.getByLabel('Contá qué acciones').fill('Observé sin mover el equipo.')
  }
  await expect(page.locator('.prepared')).toContainText('Acciones realizadas: Observé sin mover el equipo.')
  await expect(page.locator('.prepared')).toContainText('Archivo adjunto: Foto del lavarropas (simulado).')
  await expect(page.locator('.prepared')).toContainText('El lavarropas indicó que el ciclo terminó.')
  await page.reload()
  await expect(page.locator('.prepared')).toContainText('Observé sin mover el equipo.')
})
for (const choices of [['Sí','Sí','No'], ['Sí','No','Sí'], ['No sé','No sé','No sé'], ['No','No','No']]) {
  test(`Corregir respuestas y alternativas neutrales: ${choices.join('/')}`, async ({ page }) => {
    await options(page)
    await page.getByRole('button', { name: '← Atrás' }).click()
    await page.getByRole('button', { name: '← Atrás' }).click()
    await page.getByRole('button', { name: 'Corregir información' }).click()
    await expect(page.getByText('¿El lavarropas indicó que el ciclo había terminado?', { exact: true })).toBeVisible()
    await answer(page, choices)
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    const expected = choices[0] === 'Sí' ? 'El lavarropas indicó que el ciclo terminó.' : choices[0] === 'No' ? 'El lavarropas no indicó que el ciclo terminó.' : 'No sabés si el lavarropas indicó que el ciclo había terminado.'
    await expect(page.locator('.box').first()).toContainText(expected)
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await page.getByRole('button', { name: 'Ver mis opciones' }).click()
    await expect(page.getByText('Recomendación', { exact: true })).toHaveCount(0)
    await expect(page.locator('.alternative')).toHaveCount(4)
    await page.getByRole('button', { name: titles[3], exact: false }).click()
    await page.getByRole('button', { name: 'Elegir este paso' }).click()
    await expect(page.locator('.prepared')).toContainText(expected)
  })
}
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
