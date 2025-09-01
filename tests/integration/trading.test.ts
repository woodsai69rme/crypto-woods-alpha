
import { test, expect } from '@playwright/test';

test.describe('Trading Platform Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load trading dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Ultimate Crypto Trading Platform');
    
    // Check for main components
    await expect(page.locator('[data-testid="trading-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="market-overview"]')).toBeVisible();
  });

  test('should display real-time price data', async ({ page }) => {
    // Wait for price data to load
    await page.waitForSelector('[data-testid="price-display"]');
    
    const priceElement = page.locator('[data-testid="price-display"]').first();
    await expect(priceElement).not.toBeEmpty();
    
    // Verify price format (should be a number)
    const priceText = await priceElement.textContent();
    expect(priceText).toMatch(/\$[\d,]+\.?\d*/);
  });

  test('should handle trading pair selection', async ({ page }) => {
    // Click on trading pair selector
    await page.click('[data-testid="pair-selector"]');
    
    // Select a different pair
    await page.click('[data-testid="pair-ETHUSDT"]');
    
    // Verify pair changed
    await expect(page.locator('[data-testid="selected-pair"]')).toContainText('ETH/USDT');
  });

  test('should display order book data', async ({ page }) => {
    await page.waitForSelector('[data-testid="order-book"]');
    
    // Check for bids and asks
    await expect(page.locator('[data-testid="order-book-bids"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-book-asks"]')).toBeVisible();
    
    // Verify data structure
    const bidRows = page.locator('[data-testid="bid-row"]');
    await expect(bidRows.first()).toBeVisible();
  });

  test('should handle AI bot management', async ({ page }) => {
    // Navigate to AI bots section
    await page.click('[data-testid="nav-ai-bots"]');
    
    // Wait for bots to load
    await page.waitForSelector('[data-testid="ai-bot-card"]');
    
    // Check bot information display
    const botCard = page.locator('[data-testid="ai-bot-card"]').first();
    await expect(botCard).toContainText('Bot');
    await expect(botCard.locator('[data-testid="bot-status"]')).toBeVisible();
  });

  test('should perform system health check', async ({ page }) => {
    // Navigate to system health
    await page.click('[data-testid="nav-system-health"]');
    
    // Wait for health data
    await page.waitForSelector('[data-testid="health-status"]');
    
    // Verify health indicators
    await expect(page.locator('[data-testid="memory-usage"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-bots"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-status"]')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should handle login flow', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="submit-login"]');
    
    // Verify redirect or success state
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/');
    
    // Should show error state, not crash
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should handle invalid data gracefully', async ({ page }) => {
    // Mock invalid API responses
    await page.route('**/api/prices', route => 
      route.fulfill({ json: { invalid: 'data' } })
    );
    
    await page.goto('/');
    
    // Should not crash, show fallback UI
    await expect(page.locator('[data-testid="fallback-ui"]')).toBeVisible();
  });
});
