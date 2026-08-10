import { test, expect } from '../../support/fixtures/test'

test.describe('Settings', () => {
  test('SET01 Settings hub shows profile and password entries', async ({
    settingsHubPage,
  }) => {
    await settingsHubPage.goto()
    await settingsHubPage.expectLoaded()
  })

  test('SET02 Profile page renders and enters edit mode with location combobox', async ({
    settingsProfilePage,
  }) => {
    await settingsProfilePage.goto()
    await settingsProfilePage.expectLoaded()

    await test.step('Enter edit mode', async () => {
      await settingsProfilePage.startEditing()
      await expect(settingsProfilePage.firstName()).toBeVisible()
      await expect(settingsProfilePage.lastName()).toBeVisible()
      await expect(settingsProfilePage.dateOfBirth()).toBeVisible()
      await expect(settingsProfilePage.occupation()).toBeVisible()
      await expect(settingsProfilePage.urlKey()).toBeVisible()
      await expect(settingsProfilePage.location()).toHaveAttribute(
        'role',
        'combobox',
      )
      await expect(settingsProfilePage.occupation()).toHaveAttribute(
        'role',
        'combobox',
      )
    })

    await test.step('Cancel returns to view mode', async () => {
      await settingsProfilePage.cancelButton().click()
      await expect(settingsProfilePage.editButton()).toBeVisible()
      await expect(settingsProfilePage.saveButton()).toHaveCount(0)
    })
  })

  test('SET03 Location autocomplete returns city suggestions', async ({
    settingsProfilePage,
  }) => {
    await settingsProfilePage.goto()
    await settingsProfilePage.startEditing()

    const listbox = await settingsProfilePage.searchLocation('Hanoi')
    const options = listbox.getByRole('option')
    await expect(options.first()).toBeVisible({ timeout: 15_000 })
    await expect(options.first()).toContainText(/hanoi|hà nội/i)

    await options.first().click()
    await expect(settingsProfilePage.location()).toHaveValue(/hanoi|hà nội/i)
  })

  test('SET04 Password settings page renders reset CTA', async ({
    settingsHubPage,
    page,
  }) => {
    await settingsHubPage.goto()
    await settingsHubPage.openPassword()
    await expect(
      page.getByRole('heading', { name: /password|mật khẩu/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: /send reset email|gửi email đặt lại|send again|gửi lại/i,
      }),
    ).toBeVisible()
  })
})
