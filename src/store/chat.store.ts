import { create } from "zustand";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const MAX_MESSAGES = 20;

type ChatStore = {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: ChatMessage) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setMessageError: (id: string, error: string) => void;
  clearMessages: () => void;
  setStreaming: (v: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  appendToMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m,
      ),
    })),
  setMessageError: (id, error) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: error } : m,
      ),
    })),
  clearMessages: () => set({ messages: [], isStreaming: false }),
  setStreaming: (isStreaming) => set({ isStreaming }),
}));
