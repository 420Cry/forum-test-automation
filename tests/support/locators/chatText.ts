/**
 * Bilingual (en / vn) chat copy used by messaging locators.
 * Keep in sync with `chat.*` in forum-app/locales/{en,vn}/forum-common.json.
 */
export const chatText = {
  messagesLink: /^(?:messages|tin nhắn)$/i,
  heading: /messages|tin nhắn/i,
  unavailable: /messaging is not available|tin nhắn chưa sẵn sàng/i,
  sessionError: /could not open messages|không mở được tin nhắn/i,
} as const
