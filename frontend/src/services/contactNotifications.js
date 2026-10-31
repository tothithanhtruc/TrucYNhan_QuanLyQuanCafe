import { getCurrentUsername } from "./authApi";

export const CONTACT_NOTIFICATIONS_UPDATED_EVENT =
  "contact-notifications-updated";

const getSeenStorageKey = (recipientRole) => {
  const username = getCurrentUsername();
  return username
    ? `contact-notifications:${username}:${recipientRole.toLowerCase()}`
    : null;
};

const getSeenMessages = (recipientRole) => {
  const key = getSeenStorageKey(recipientRole);
  if (!key) return {};

  const stored = localStorage.getItem(key);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Không thể đọc trạng thái thông báo liên hệ:", error);
    return {};
  }
};

const getLatestMessage = (contact) => {
  const messages = contact.messages || [];
  return messages.length ? messages[messages.length - 1] : null;
};

const getMessageKey = (message) =>
  message.id ?? `${message.createdAt || ""}:${message.message || ""}`;

export const isContactUnread = (contact, recipientRole) => {
  const latestMessage = getLatestMessage(contact);
  const expectedSender = recipientRole === "ADMIN" ? "USER" : "ADMIN";
  if (!latestMessage || latestMessage.senderRole !== expectedSender) return false;

  const seenMessages = getSeenMessages(recipientRole);
  return seenMessages[contact.id] !== getMessageKey(latestMessage);
};

export const getUnreadContactCount = (contacts, recipientRole) =>
  contacts.filter((contact) => isContactUnread(contact, recipientRole)).length;

export const markContactMessagesSeen = (
  contacts,
  recipientRole,
  contactId = null,
) => {
  const key = getSeenStorageKey(recipientRole);
  if (!key) return;

  const expectedSender = recipientRole === "ADMIN" ? "USER" : "ADMIN";
  const seenMessages = getSeenMessages(recipientRole);
  let changed = false;

  contacts
    .filter((contact) => contactId === null || contact.id === contactId)
    .forEach((contact) => {
      const latestMessage = getLatestMessage(contact);
      if (latestMessage?.senderRole !== expectedSender) return;

      const messageKey = getMessageKey(latestMessage);
      if (seenMessages[contact.id] !== messageKey) {
        seenMessages[contact.id] = messageKey;
        changed = true;
      }
    });

  if (changed) {
    localStorage.setItem(key, JSON.stringify(seenMessages));
    window.dispatchEvent(new Event(CONTACT_NOTIFICATIONS_UPDATED_EVENT));
  }
};
