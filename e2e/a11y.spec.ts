import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/oferta",
  "/cennik",
  "/galeria",
  "/dla-kogo",
  "/faq",
  "/kontakt",
  "/dojazd",
  "/zapytaj-o-termin",
  "/regulamin",
  "/polityka-prywatnosci",
  "/cookies",
];

test.describe("accessibility smoke", () => {
  for (const route of routes) {
    test(`has no serious axe violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
      expect(blocking, JSON.stringify(blocking.map((violation) => violation.id))).toEqual([]);
    });
  }
});
