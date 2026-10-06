/**
 * Testes E2E para fluxo de onboarding
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ir para página inicial
    await page.goto('/');
  });

  test('should show disclaimer on first visit', async ({ page }) => {
    // Verificar que disclaimer aparece
    await expect(page.locator('text=Aviso Legal')).toBeVisible();
    await expect(page.locator('text=MoujApp é uma ferramenta')).toBeVisible();
  });

  test('should require accepting disclaimer', async ({ page }) => {
    // Não pode clicar em continuar sem aceitar
    const continueButton = page.locator('button:has-text("Aceitar")');
    await expect(continueButton).toBeDisabled();

    // Aceitar checkbox
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();

    // Agora botão deve estar habilitado
    await expect(continueButton).toBeEnabled();
  });

  test('should navigate through onboarding steps', async ({ page }) => {
    // Aceitar disclaimer
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();

    const continueButton = page.locator('button:has-text("Aceitar")');
    await continueButton.click();

    // Deve estar no onboarding
    await expect(page).toHaveURL(/\/onboarding/);

    // Verificar que primeiro passo aparece
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 5000 });
  });

  test('should save onboarding data to localStorage', async ({ page }) => {
    // Aceitar disclaimer
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();

    const continueButton = page.locator('button:has-text("Aceitar")');
    await continueButton.click();

    // Aguardar onboarding carregar
    await page.waitForURL(/\/onboarding/);

    // Verificar que localStorage tem dados
    const onboardingData = await page.evaluate(() => {
      return localStorage.getItem('moujapp-onboarding');
    });

    expect(onboardingData).toBeTruthy();

    const parsed = JSON.parse(onboardingData!);
    expect(parsed.currentStep).toBeGreaterThanOrEqual(0);
    expect(parsed.completedOnboarding).toBeDefined();
  });

  test('should handle disclaimer persistence', async ({ page, context }) => {
    // Aceitar disclaimer
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();

    const continueButton = page.locator('button:has-text("Aceitar")');
    await continueButton.click();

    // Aguardar navegação
    await page.waitForURL(/\/onboarding/);

    // Recarregar página
    await page.reload();

    // Disclaimer não deve aparecer de novo
    const disclaimer = page.locator('text=Aviso Legal');
    await expect(disclaimer).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Disclaimer Compliance', () => {
  test('should show medical disclaimer', async ({ page }) => {
    await page.goto('/');

    // Buscar por texto de disclaimer
    await expect(page.locator('text=NÃO é um aplicativo médico')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should have emergency numbers', async ({ page }) => {
    await page.goto('/');

    // Abrir modal se necessário
    const disclaimerText = page.locator('text=SAMU');
    await expect(disclaimerText).toBeVisible({ timeout: 5000 });
  });
});
