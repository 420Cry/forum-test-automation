/**
 * Bilingual (en / vn) chat copy used by messaging locators.
 * Keep in sync with `chat.*` in forum-app/locales/{en,vn}/forum-common.json.
 */
export const chatText = {
  messagesLink: /^(?:messages|tin nhắn)$/i,
  heading: /messages|tin nhắn/i,
  peopleHint: /message someone you follow|nhắn tin với người bạn theo dõi/i,
  notConnected: /follow each other first|hãy theo dõi nhau trước/i,
  unavailable: /messaging is not available|tin nhắn chưa sẵn sàng/i,
  sessionError: /could not open messages|không mở được tin nhắn/i,
  sendButton: /send message|gửi tin nhắn/i,
  messageCta:
    /^(?:message|nhắn tin|sign in to message|đăng nhập để nhắn tin)$/i,
  /** `chat.aria.status_*` — aria-labels on the delivery indicator. */
  status: {
    pending: /^(?:sending|đang gửi)$/i,
    settled: /^(?:sent|delivered|seen|đã gửi|đã nhận|đã xem)$/i,
    any: /^(?:sending|failed to send|sent|delivered|seen|đang gửi|gửi thất bại|đã gửi|đã nhận|đã xem)$/i,
  },
} as const
