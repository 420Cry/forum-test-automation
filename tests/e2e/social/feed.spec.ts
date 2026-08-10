import { test } from '../../support/fixtures/test'

test.describe('Social feed', () => {
  test('SOC01 Social placeholder renders heading and copy', async ({
    socialPage,
  }) => {
    await socialPage.goto()
    await socialPage.expectLoaded()
  })
})
