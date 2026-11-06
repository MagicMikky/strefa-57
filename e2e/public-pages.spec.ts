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

  test("moves from the homepage to pricing and the inquiry form", async ({ page, isMobile }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Tylko niezbędne" }).click();
    if (isMobile) {
      await page.getByRole("button", { name: "Otwórz menu" }).click();
    }
    const nav = page.getByRole("navigation", { name: isMobile ? "Nawigacja mobilna" : "Główna nawigacja" });
    await nav.getByRole("link", { name: "Cennik" }).click();
    await expect(page).toHaveURL(/\/cennik$/);
    await page.getByRole("link", { name: "Poproś o wycenę" }).click();
    await expect(page).toHaveURL(/\/zapytaj-o-termin/);
  });
});
