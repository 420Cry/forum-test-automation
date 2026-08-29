import { test, expect } from '../../support/fixtures/test'

test.describe.configure({ mode: 'serial' })

test.describe('Find directory', () => {
  test('FIND01 Loads directory search UI', async ({ findPage }) => {
    await findPage.goto()
    await findPage.expectLoaded()
    await expect(findPage.filtersButton()).toBeVisible()
    await expect(findPage.sortButton()).toBeVisible()
  })

  test('FIND02 Opens filters drawer with multi-select facets', async ({
    findPage,
  }) => {
    await findPage.goto()
    await findPage.openFilters()

    const drawer = findPage.drawer()
    await expect(drawer.getByText(/filters|bộ lọc/i).first()).toBeVisible()
    await expect(
      drawer.getByRole('button', { name: /any|bất kỳ/i }).first(),
    ).toBeVisible()
    await expect(
      drawer.getByRole('button', { name: /show results|xem kết quả/i }),
    ).toBeVisible()

    await drawer
      .getByRole('button', { name: /dismiss|close|đóng/i })
      .click()
    await expect(drawer).toBeHidden({ timeout: 15_000 })
  })

  test('FIND03 Opens sort drawer and can pick name sort', async ({
    findPage,
  }) => {
    await findPage.goto()
    await findPage.openSort()

    const drawer = findPage.drawer()
    await expect(drawer.getByText(/newest|mới nhất/i)).toBeVisible()
    await expect(drawer.getByText(/name a|tên a/i)).toBeVisible()

    await drawer.getByRole('button', { name: /name a|tên a/i }).click()
    await expect(drawer).toBeHidden()
    await expect(findPage.sortButton()).toContainText(/name a|tên a/i)
  })

  test('FIND04 Type and role pills switch directory filters', async ({
    findPage,
  }) => {
    await findPage.goto()
    await findPage.selectType(/people|người/i)
    await findPage.selectRole(/founder/i)
    await findPage.selectRole(/investor/i)
    await findPage.selectType(/^(?:all|tất cả)$/i)
    await expect(findPage.heading()).toBeVisible()
  })

  test('FIND05 Search submits and shows results or empty state', async ({
    findPage,
  }) => {
    await findPage.goto()
    await findPage.expectLoaded()
    await findPage.search('a')
    await expect(findPage.emptyOrResults().first()).toBeVisible({
      timeout: 20_000,
    })
  })
})
