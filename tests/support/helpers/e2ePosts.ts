import { apiPost } from './e2eApi'

/** Seed `count` published posts for the authenticated `token`'s account. */
export async function seedPosts(token: string, count: number): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    const res = await apiPost(token, '/posts', {
      content: `E2E pagination post ${i} — ${Date.now()}`,
      visibility: 'public',
    })
    if (!res.ok) {
      throw new Error(
        `Failed to seed post ${i} (${res.status}): ${(await res.text()).slice(0, 200)}`,
      )
    }
  }
}
