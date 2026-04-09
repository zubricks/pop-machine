import { test, expect } from '@playwright/test'

test('vending machine loads with 6 soda buttons', async ({ page }) => {
  await page.goto('/')
  const buttons = page.locator('button').filter({ hasText: /left|—/ })
  await expect(buttons).toHaveCount(6)
})

test('inserting coins updates the display', async ({ page }) => {
  await page.goto('/')
  await page.getByText('INSERT COIN').click()
  await expect(page.getByText('$0.25')).toBeVisible()
})
