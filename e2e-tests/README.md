# 🧪 E2E Testing - Sistem Piket Sekretariat Informatika

Comprehensive End-to-End testing untuk aplikasi Sistem Piket menggunakan Playwright.

## 📋 **Test Coverage**

### **Pengujian Fungsional**
- ✅ Authentication (Login, Register, Reset Password)
- ✅ Dashboard (Admin & User views)
- ✅ Absensi (Masuk, Checklist, Keluar)
- ✅ Jadwal Piket (Generate, Save, View, Delete)
- ✅ Inventaris (CRUD, Bulk Upload)
- ✅ Laporan (Absensi, Inventaris, Export)
- ✅ User Management (Admin only)

### **Pengujian Non-Fungsional**
- ✅ Performance Testing (Page Load, API Response, Core Web Vitals)
- ✅ Compatibility Testing (8+ Browsers)
- ✅ Responsive Design Testing
- ✅ Security Testing

## 🌐 **Browser Coverage (8+ Browsers)**

### Desktop Browsers
1. ✅ Chrome Latest
2. ✅ Firefox Latest
3. ✅ Safari Latest
4. ✅ Edge Latest

### Mobile Browsers
5. ✅ Mobile Chrome (Android)
6. ✅ Mobile Safari (iOS)
7. ✅ iPad Safari
8. ✅ Samsung Internet (Galaxy S21)

## 🚀 **Setup**

### Prerequisites
- Node.js 18+ installed
- Internet connection (untuk akses besti.app)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers
```

## 📝 **Running Tests**

### Run All Tests
```bash
npm test
```

### Run Functional Tests Only
```bash
npm run test:functional
```

### Run Performance Tests
```bash
npm run test:performance
```

### Run Compatibility Tests
```bash
npm run test:compatibility
```

### Run Specific Browser
```bash
# Chrome only
npm run test:chrome

# Firefox only
npm run test:firefox

# Safari only
npm run test:safari

# Mobile browsers
npm run test:mobile
```

### Run All 8+ Browsers
```bash
npm run test:all-browsers
```

### Debug Mode
```bash
# Run with browser visible
npm run test:headed

# Run with Playwright Inspector
npm run test:debug

# Run with UI mode
npm run test:ui
```

## 📊 **View Reports**

After running tests, view the HTML report:

```bash
npm run report
```

Reports are generated in:
- `reports/playwright-report/` - HTML report
- `reports/test-results.json` - JSON format
- `reports/junit-results.xml` - JUnit format
- `reports/screenshots/` - Screenshots of failures

## 📁 **Project Structure**

```
e2e-tests/
├── tests/
│   ├── functional/              # Pengujian Fungsional
│   │   ├── auth/
│   │   │   └── login.spec.js
│   │   ├── dashboard/
│   │   │   └── dashboard.spec.js
│   │   ├── absensi/
│   │   ├── jadwal/
│   │   ├── inventaris/
│   │   ├── laporan/
│   │   └── user-management/
│   │
│   └── non-functional/          # Pengujian Non-Fungsional
│       ├── performance/
│       │   └── performance.spec.js
│       └── compatibility/
│           └── cross-browser.spec.js
│
├── utils/                       # Helper functions
├── reports/                     # Test reports & screenshots
├── playwright.config.js         # Playwright configuration
└── package.json
```

## 🎯 **Test Credentials**

### Admin Account
- Username: `admin`
- Password: `admin123`

### User Account
- Username: `user1`
- Password: `user123`

## 📈 **Performance Metrics**

Tests verify the following performance criteria:

- ✅ First Contentful Paint (FCP) < 1.8s
- ✅ Largest Contentful Paint (LCP) < 2.5s
- ✅ Time to Interactive (TTI) < 3.8s
- ✅ Total Page Load < 3s
- ✅ API Response Time < 500ms
- ✅ Page Size < 2MB
- ✅ Number of Requests < 50

## 🔧 **Configuration**

Edit `playwright.config.js` to customize:
- Base URL
- Timeout settings
- Browser configurations
- Reporter options
- Screenshot/video settings

## 📝 **Writing New Tests**

Example test structure:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/page');
  });

  test('TC-XXX-001: Test description', async ({ page }) => {
    // Test steps
    await page.click('button');
    
    // Assertions
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## 🐛 **Troubleshooting**

### Tests failing due to timeout
- Increase timeout in `playwright.config.js`
- Check internet connection
- Verify besti.app is accessible

### Screenshots not generated
- Check `reports/screenshots/` folder permissions
- Ensure tests are failing (screenshots only on failure)

### Browsers not installed
```bash
npm run install:browsers
```

## 📚 **Resources**

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)

## 🎉 **Success Criteria**

- ✅ Functional Tests: 95%+ pass rate
- ✅ Performance: All metrics meet targets
- ✅ Compatibility: 100% across 8+ browsers
- ✅ Zero critical bugs

## 📧 **Support**

For issues or questions, contact the development team.

---

**Last Updated:** December 2025
**Version:** 1.0.0
