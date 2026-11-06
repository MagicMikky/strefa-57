import { expect, test } from "@playwright/test";

const widths = [360, 390, 768, 1024, 1440];
const routes = ["/", "/oferta", "/cennik", "/galeria", "/kontakt", "/zapytaj-o-termin", "/dojazd"];

test.describe("horizontal layout", () => {
  for (const width of widths) {
    test(`does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, route).toBeLessThanOrEqual(1);
      }
    });
  }
});
