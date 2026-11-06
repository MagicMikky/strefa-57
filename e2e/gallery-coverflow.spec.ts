import { expect, test, type Page } from "@playwright/test";

async function openGallery(page: Page, path = "/galeria") {
  await page.goto(path);
  const cookies = page.getByRole("button", { name: "Tylko niezbędne" });
  await cookies.waitFor({ state: "visible", timeout: 1500 }).then(() => cookies.click()).catch(() => undefined);
}

test.describe("gallery coverflow", () => {
  test("shows only categories that have published photos", async ({ page }) => {
    await openGallery(page);
    await expect(page.getByRole("tab", { name: "Wszystkie" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Atrakcje" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Teren" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Okopy i bunkry" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Najlepsi zawodnicy" })).toHaveCount(0);
    await expect(page.getByText("Aktywny filtr: Wszystkie.")).toBeVisible();
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Okopy");
  });

  test("filters to one photo and returns to the full reel", async ({ page }) => {
    await openGallery(page);
    await page.getByRole("tab", { name: "Atrakcje" }).click();
    await expect(page.getByText("Aktywny filtr: Atrakcje.")).toBeVisible();
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Rakieta V2");
    await expect(page.getByText("1 z 1")).toBeVisible();
    await expect(page.getByRole("button", { name: "Poprzednie zdjęcie" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Następne zdjęcie" })).toBeDisabled();
    await page.getByRole("tab", { name: "Wszystkie" }).click();
    await expect(page.getByText("1 z 3")).toBeVisible();
  });

  test("moves with buttons, side photos and keyboard without global arrow capture", async ({ page }) => {
    await openGallery(page);
    await page.getByRole("button", { name: "Następne zdjęcie" }).click();
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Teren");
    await expect(page.getByText("2 z 3")).toBeVisible();
    await page.locator("[data-offset='1']").click();
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Rakieta V2");
    await page.getByRole("link", { name: "Poznaj atrakcje" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Rakieta V2");
    await page.getByTestId("gallery-coverflow").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Teren");
    const slide = page.locator("[data-offset='0']");
    const slideBox = await slide.boundingBox();
    const reelBox = await page.getByTestId("gallery-coverflow").boundingBox();
    expect(slideBox).not.toBeNull();
    expect(reelBox).not.toBeNull();
    if (slideBox && reelBox) {
      const slideCenter = slideBox.x + slideBox.width / 2;
      const reelCenter = reelBox.x + reelBox.width / 2;
      expect(Math.abs(slideCenter - reelCenter)).toBeLessThan(48);
    }
  });

  test("opens and closes the lightbox and keeps focus", async ({ page }) => {
    await openGallery(page);
    const opener = page.locator("[data-offset='0']");
    await opener.click();
    const dialog = page.locator(".lightbox");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Okopy\. Podejście przez teren\. 1 z 3/)).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Zamknij" })).toBeFocused();
    await dialog.getByRole("button", { name: "Następne zdjęcie" }).click();
    await expect(dialog.getByText(/Teren\. Osłona w lesie\. 2 z 3/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pokaż na środku: Okopy" })).toBeFocused();
  });

  test("swipes to the next photo", async ({ page }) => {
    await openGallery(page);
    const reel = page.getByTestId("gallery-coverflow");
    await reel.scrollIntoViewIfNeeded();
    const box = await reel.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    const startX = box.x + box.width * 0.72;
    const endX = box.x + box.width * 0.18;
    const y = box.y + Math.min(80, box.height / 3);
    const client = await page.context().newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: startX, y }],
    });
    for (const step of [0.25, 0.5, 0.75, 1]) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: startX + (endX - startX) * step, y }],
      });
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Teren");
  });

  test("shows an empty category message without a broken reel", async ({ page }) => {
    await openGallery(page, "/galeria?filtr=pusta");
    await expect(page.getByRole("status").filter({ hasText: "W tej kategorii nie ma jeszcze zdjęć." })).toBeVisible();
    await expect(page.getByTestId("gallery-coverflow")).toHaveCount(0);
    await page.getByRole("tab", { name: "Teren" }).click();
    await expect(page.locator("[data-offset='0']")).toHaveAttribute("aria-label", "Powiększ zdjęcie: Teren");
  });

  test("does not widen the page at 360 or 1920", async ({ page }) => {
    for (const width of [360, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await openGallery(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, String(width)).toBeLessThanOrEqual(1);
    }
  });
});
