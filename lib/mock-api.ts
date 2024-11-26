import { nanoid } from 'nanoid';
import { subDays, subHours } from 'date-fns';

export function generateMockChats(count = 10) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => ({
    id: nanoid(),
    title: `Mock Chat ${index + 1}`,
    createdAt: subDays(now, Math.floor(Math.random() * 30)),
  }));
}

export function generateMockMessages(chatId: string, count = 5) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => ({
    id: nanoid(),
    chatId,
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: `Mock message ${index + 1} for chat ${chatId}`,
    createdAt: subHours(now, Math.floor(Math.random() * 24)),
  }));
}

export function generateMockDocuments(count = 3) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => ({
    id: nanoid(),
    title: `Mock Document ${index + 1}`,
    content: `This is the content of mock document ${index + 1}`,
    createdAt: subDays(now, Math.floor(Math.random() * 10)),
  }));
}

export function generateMockSuggestions(documentId: string, count = 2) {
  return Array.from({ length: count }, (_, index) => ({
    id: nanoid(),
    documentId,
    description: `Suggestion ${index + 1} for document ${documentId}`,
    selectionStart: Math.floor(Math.random() * 100),
    selectionEnd: Math.floor(Math.random() * 200),
  }));
}

export function generateMockVotes(messageIds: string[]) {
  return messageIds.map(messageId => ({
    messageId,
    isUpvoted: Math.random() > 0.5,
  }));
}
