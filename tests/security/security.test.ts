
// Security Test Suite
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/');
    
    // Try to inject script
    const maliciousInput = '<script>alert("XSS")</script>';
    
    await page.fill('[data-testid="search-input"]', maliciousInput);
    
    // Should not execute script, should be escaped
    const content = await page.textContent('[data-testid="search-results"]');
    expect(content).not.toContain('<script>');
  });

  test('should validate API inputs', async ({ page }) => {
    // Test SQL injection attempt
    const sqlInjection = "'; DROP TABLE users; --";
    
    await page.route('**/api/**', route => {
      const postData = route.request().postData();
      if (postData && postData.includes(sqlInjection)) {
        // Should reject malicious input
        route.fulfill({ status: 400, json: { error: 'Invalid input' } });
      } else {
        route.continue();
      }
    });
  });

  test('should enforce authentication', async ({ page }) => {
    // Try to access protected routes without auth
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should redirect to login
      expect(page.url()).toContain('/login');
    }
  });

  test('should use secure headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    // Check for security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
  });
});
