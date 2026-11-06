import { expect, test } from "@playwright/test";

const routes = ["/", "/oferta", "/cennik", "/galeria", "/dla-kogo", "/faq", "/kontakt", "/dojazd", "/zapytaj-o-termin"];

test.describe("public pages", () => {
  for (const route of routes) {
    test(`renders ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBe(true);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }
});
