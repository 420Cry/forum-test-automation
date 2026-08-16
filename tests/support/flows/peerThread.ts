import { expect } from '@playwright/test'
import { env } from '../../config/env'
import type { MessagesPage } from '../pageObjects/MessagesPage'
import type { ProfilePage } from '../pageObjects/ProfilePage'

/** Peer url-key required by every peer-messaging spec. */
export function requirePeerKey(): string {
  const peerKey = env.peerUrlKey()
  expect(peerKey, 'E2E_PEER_URL_KEY is required for peer messaging').toBeTruthy()
  return peerKey
}

/**
 * Follow the peer, then open their DM thread from the profile CTA.
 * Resolves to `false` when Sendbird messaging is unavailable in this env.
 *
 * The follow edge is shared state: FLW02 / PROF06 / MSG07 unfollow the same peer
 * from other workers (`fullyParallel`), so the API DM gate can reject a follow
 * that existed moments ago. Reload the profile, re-follow and retry the CTA.
 */
export async function openPeerThread(
  profilePage: ProfilePage,
  messagesPage: MessagesPage,
  peerKey: string,
): Promise<boolean> {
  await expect(async () => {
    await profilePage.goto(peerKey)
    await profilePage.expectOtherProfile()
    await profilePage.followPeer()
    await messagesPage.profileMessageButton().click()
    await messagesPage.expectOnInbox()
  }).toPass({ timeout: 45_000, intervals: [1_000, 2_000] })

  await messagesPage.assertAppReachable()
  return messagesPage.isMessagingAvailable()
}
