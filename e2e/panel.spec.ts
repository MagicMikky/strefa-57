import { expect, test } from "@playwright/test";

test("panel requires a session and is not offered as public registration", async ({ page }) => {
  const signup = await page.request.post("/api/auth/sign-up/email", {
    data: {
      email: "public@example.com",
      password: "longpassword1",
      name: "Public",
    },
  });
  expect(signup.ok()).toBe(false);
  expect(await signup.text()).not.toContain("longpassword1");

  await page.goto("/panel/zgloszenia");
  await expect(page).toHaveURL(/\/panel\/logowanie/);
  await expect(page.getByRole("heading", { name: "Logowanie pracownika" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
