import { test } from '../../support/fixtures/test'

test.describe('Social feed', () => {
  test('SOC01 Social feed shell renders for the signed-in account', async ({
    socialPage,
  }) => {
    await socialPage.goto()
    await socialPage.expectSocialLoaded()
  })
})
