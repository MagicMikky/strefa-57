import { expect, test, type Page } from "@playwright/test";

async function fillValidInquiry(page: Page) {
  await page.goto("/zapytaj-o-termin");
  await page.getByRole("button", { name: "Tylko niezbędne" }).click();
  await page.locator("input[name='playerCount']").fill("8");
  await page.locator("select[name='packageId']").selectOption("pierwsza-misja");
  await page.locator("input[name='preferredDate']").fill("2027-06-01");
  await page.locator("select[name='eventType']").selectOption("znajomi");
  await page.locator("input[name='name']").fill("Anna");
  await page.locator("input[name='email']").fill("anna@example.com");
  await page.locator("input[name='privacyAccepted']").check();
  await page.locator("button[type='submit']").click();
}

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

  test("opens a package inquiry with the package preselected", async ({ page }) => {
    await page.goto("/cennik");
    await page.getByRole("button", { name: "Tylko niezbędne" }).click();
    await page.getByRole("link", { name: "Zapytaj o ten pakiet" }).first().click();
    await expect(page).toHaveURL(/\/zapytaj-o-termin\?pakiet=/);
    await expect(page.locator("select[name='packageId']")).not.toHaveValue("nie-wiem");
  });

  test("shows success only after the server accepts the inquiry", async ({ page }) => {
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "Zapytanie zostało wysłane. Termin nie jest jeszcze zarezerwowany ani zablokowany.",
        }),
      });
    });
    await fillValidInquiry(page);
    await expect(page.getByRole("status")).toContainText("nie jest jeszcze zarezerwowany");
    await expect(page.locator("input[name='name']")).toHaveValue("");
  });

  test("keeps entered data after a server error", async ({ page }) => {
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          message: "Nie udało się wysłać zapytania. Spróbuj ponownie za chwilę.",
        }),
      });
    });
    await fillValidInquiry(page);
    await expect(page.locator("form").getByRole("alert")).toContainText("Nie udało się wysłać zapytania");
    await expect(page.locator("input[name='name']")).toHaveValue("Anna");
  });

  test("keeps entered data after a rejected inquiry", async ({ page }) => {
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          message: "Popraw zaznaczone pola i wyślij zapytanie ponownie.",
          fieldErrors: { name: "Podaj imię organizatora (od 2 do 100 znaków)." },
        }),
      });
    });
    await fillValidInquiry(page);
    await expect(page.locator("form").getByRole("alert")).toContainText("Popraw zaznaczone pola");
    await expect(page.locator("input[name='name']")).toHaveValue("Anna");
  });

  test("keeps entered data when the network fails", async ({ page }) => {
    await page.route("**/api/inquiry", (route) => route.abort("failed"));
    await fillValidInquiry(page);
    await expect(page.locator("form").getByRole("alert")).toContainText("Nie udało się połączyć z serwerem");
    await expect(page.locator("input[name='name']")).toHaveValue("Anna");
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
