// src/i18n.js
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    title: 'Chat',
    send: 'Send',
    inputPlaceholder: 'Type a message...'
  },
  zh: {
    title: '聊天',
    send: '发送',
    inputPlaceholder: '输入消息...'
  },
  ja: {
    title: 'チャット',
    send: '送信',
    inputPlaceholder: 'メッセージを入力...'
  }
};

export const i18n = createI18n({
  legacy: false, // 重要！支持 composition API
  locale: 'en',
  messages
});
