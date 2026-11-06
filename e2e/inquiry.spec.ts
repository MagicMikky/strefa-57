import { expect, test } from "@playwright/test";

test.describe("inquiry form", () => {
  test("preselects an event type mapped from an audience slug", async ({ page }) => {
    await page.goto("/zapytaj-o-termin?wydarzenie=kawalerskie-panienskie");
    await expect(page.locator("select[name='eventType']")).toHaveValue("kawalerskie-panienskie");
  });

  test("shows a validation error and keeps the form available", async ({ page }) => {
    await page.goto("/zapytaj-o-termin");
    await page.getByRole("button", { name: "Tylko niezbędne" }).click();
    await page.locator("input[name='playerCount']").fill("8");
    await page.locator("select[name='packageId']").selectOption("pierwsza-misja");
    await page.locator("input[name='preferredDate']").fill("2027-06-01");
    await page.locator("select[name='eventType']").selectOption("znajomi");
    await page.locator("input[name='name']").fill("A");
    await page.locator("input[name='email']").fill("anna@example.com");
    await page.locator("input[name='privacyAccepted']").check();
    await page.locator("button[type='submit']").click();
    await expect(page.getByText("Popraw zaznaczone pola")).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
  });

  test("cookie dialog can be accepted from the keyboard", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Akceptuj analityczne" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
  });
});
