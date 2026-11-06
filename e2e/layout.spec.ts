import { expect, test } from "@playwright/test";

const widths = [375, 768, 1280, 1440];
const routes = ["/", "/oferta", "/cennik", "/galeria", "/kontakt", "/zapytaj-o-termin", "/dojazd", "/rezerwacja"];

test.describe("horizontal layout", () => {
  for (const width of widths) {
    for (const route of routes) {
      test(`does not overflow ${route} at ${width}px`, async ({ page }) => {
        test.setTimeout(60_000);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const details = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const offenders = [...document.querySelectorAll("body *")]
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                name: `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).trim().split(/\s+/).slice(0, 2).join(".")}` : ""}`,
                right: Math.round(rect.right),
              };
            })
            .filter((item) => item.right > viewport + 1)
            .sort((a, b) => b.right - a.right)
            .slice(0, 5);
          return {
            overflow: document.documentElement.scrollWidth - viewport,
            offenders,
          };
        });
        expect(details.overflow, `${route} ${JSON.stringify(details.offenders)}`).toBeLessThanOrEqual(1);
      });
    }
  }
});
