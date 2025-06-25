<template>
            
  <div class="login-modal" v-if="!staffToken">
      <div class="login-box">
        <h3>登录</h3>
        <p>点击下方按钮授权</p>
        <button class="login-button" @click="handleLogin">一键登录 Telegram</button>
      </div>
    </div>
  <div class="chat-container">
    <!-- 左侧模块切换 -->
    <div class="sidebar">
      <div class="module-switch">
        <div :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">💬<p>聊天</p></div>
        <div :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">⚙️<p>设置</p></div>
        <div :class="{ active: activeTab === 'other' }" @click="activeTab = 'other'">📁<p>其他</p></div>
      </div>
    </div>

    <!-- 中间 + 右侧 -->
    <div class="chat-wrapper">
      <!-- 聊天模块 -->
      <div v-if="activeTab === 'chat'" class="chat-main-wrapper">
        <!-- 好友列表 -->
      <div class="session-list">
        <div v-for="session in sessions" :key="session.id"
            class="session-item"
            :class="{ active: session.id === currentSessionId }"
            @click="selectSession(session.id,session.nickname)">
            
          <img v-if="session.avatar_base64" :src="session.avatar_base64"
              alt="头像" class="avatar" />
          <div v-else class="avatar placeholder"></div>

          {{ session.nickname }}
        </div>
      </div>


        <!-- 聊天主区域 -->
        <div class="chat-main">
          <div class="chat-header">
            
            <span>{{ currentSessionNickname }}</span>
          </div>

         <div class="chat-body" ref="chatBody">
  <div
    v-for="msg in messages"
    :key="msg.id"
    class="chat-line"
    :class="msg.sender_type === 0 ? 'left' : 'right'"
  >
    <div class="bubble">
      <template v-if="msg.message_type === 'text'">
        <div  class="border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'">{{ msg.content }} <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">{{ formatTime(msg.sent_at) }}</div></div>
      </template>

      <template v-else-if="msg.message_type === 'photo'">
        <img :src="msg.file_url" alt="图片" class="border" />
      </template>

      <template v-else-if="msg.message_type === 'voice'">
        <div  class="border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'">
          <audio controls :src="msg.file_url" />
          <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">{{ formatTime(msg.sent_at) }}</div>
        </div>
      </template>

      <template v-else-if="msg.message_type === 'video'">
        <video controls :src="msg.file_url" class="chat-video" />
      </template>

      <template v-else-if="msg.message_type === 'document'">
        
        <div  class="border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'"><a :href="msg.file_url" target="_blank">📎 下载文件</a> <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">{{ formatTime(msg.sent_at) }}</div></div>
      </template>

      <template v-else-if="msg.message_type === 'sticker'">
        <img :src="msg.file_url" alt="表情贴纸" class="chat-sticker border" />
      </template>

      <template v-else-if="msg.message_type === 'location'">
        <div class="chat-location border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'">
          📍{{ msg.content }}
        </div>
      </template>

      <template v-else>
        <span>❓ 暂不支持的消息类型{{ msg.content }} <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">{{ formatTime(msg.sent_at) }}</div></span>
      </template>
    </div>
  </div>
</div>


          <div class="chat-footer">


            <!-- 输入框 -->
            <input v-model="input" ref="chatInput" :placeholder="t('inputPlaceholder')" @keyup.enter="sendMessage" />
            <!-- 😄 表情按钮 -->
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="emoji-btn" @click="toggleEmoji">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                  10-4.48 10-10S17.52 2 12 2zm0 18c-4.41
                  0-8-3.59-8-8s3.59-8 8-8 8 3.59 8
                  8-3.59 8-8 8zm-4-4h8c0 2-4 3-4 3s-4-1-4-3zm0-6c.83
                  0 1.5-.67 1.5-1.5S8.83 7 8 7s-1.5.67-1.5
                  1.5S7.17 10 8 10zm8 0c.83 0 1.5-.67
                  1.5-1.5S16.83 7 16 7s-1.5.67-1.5
                  1.5S15.17 10 16 10z" fill="#4aace5"/>
              </svg>
            <!-- 📤 发送按钮 -->
              <svg v-if="input" width="40" height="40" viewBox="0 0 24 24" fill="#4aace5" class="send-btn" @click="sendMessage">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
          </div>

        </div>

        <!-- 右侧工具栏 -->
        <div class="tools-panel">
          <div class="tool-card">
            <h3>快捷回复</h3>
            <ul>
              <li v-for="item in quickReplies" :key="item.id" @click="quickReply(item.content)">
                {{ item.content }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 设置模块 -->
      <div v-if="activeTab === 'settings'" class="center-placeholder">
        <h2>设置</h2>
        <p>这里是设置页面内容。</p>
        <select v-model="selectedLanguage" @change="switchLanguage">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>

      </div>

      <!-- 其他模块 -->
      <div v-if="activeTab === 'other'" class="center-placeholder">
        <h2>其他</h2>
        <p>这里是其他功能模块。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const API_BASE_URL = 'http://localhost:3000/api';
const WS_BASE_URL = 'ws://localhost:3000/ws';


const loginCode = Math.random().toString(36).substring(2); // 可用UUID替代
const loginLink = document.getElementById('loginLink');
const staffToken =  ref(localStorage.getItem('staffToken')?localStorage.getItem('staffToken'):null);
let authCode = ref("");
let timer = ref("");
const activeTab = ref('chat');
const sessions = ref([]);
const quickReplies = ref([]);
const currentSessionId = ref(null);
const currentSessionNickname = ref(null);
const messages = ref([]);
const input = ref('');
const selectedLanguage = ref('en');
const chatBody = ref(null);
let socket = null;

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
];

onMounted(async () => {
  socket = new WebSocket(WS_BASE_URL);
  try {
    const res = await axios.get(`${API_BASE_URL}/sessions`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('staffToken')}`
    }});
    sessions.value = res.data.data;
    if (sessions.value.length > 0) {
      selectSession(sessions.value[0].id,sessions.value[0].nickname);
    }
  } catch (e) {
    console.error('加载会话列表失败', e);
  }
  try {
    const res = await axios.get(`${API_BASE_URL}/quick_replies`);
    quickReplies.value = res.data.data;
  } catch (e) {
    console.error('获取快捷回复失败', e);
  }
  
});
async function selectSession(sessionId,sessionNickname) {
  currentSessionId.value = sessionId;
  currentSessionNickname.value = sessionNickname;
  try {
    const res = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/messages`);
    messages.value = res.data.data;

    await nextTick();
    scrollToBottom();
  } catch (e) {
    console.error('加载消息失败', e);
  }
}

function sendMessage() {
  if (!input.value.trim() || !currentSessionId.value) return;

  axios.post(`${API_BASE_URL}/messages/send`, {
    session_id: currentSessionId.value,
    content: input.value,
    type: 'text'
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('staffToken')}`
    }
  }).catch(err => {
    console.error('发送失败', err);
  });
  messages.value.push({ id: 1, sender_type: 1, content: input.value ,message_type: "text" ,sent_at:formatDateTime() });
  console.log(messages.value)
  input.value = '';
  nextTick(scrollToBottom);
}
function formatDateTime() {
  const date = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
async  function handleLogin() {
  try {
    const res = await fetch(`${API_BASE_URL}/staffs/auth-code/generate`);
    const data = await res.json();
    if (data.code === 0 && data.data.authCode) {
      authCode.value = data.data.authCode;
      const tgLink = `https://t.me/${data.data.botUsername}?start=${data.data.authCode}`;
      window.open(tgLink, '_blank');
      startPolling();
    } else {
      alert('获取登录码失败，请稍后重试');
    }
  } catch (error) {
    console.error('登录异常:', error);
    alert('网络错误');
  }
}
function startPolling() {
  timer.value = setInterval(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/staffs/auth-code/check?token=${authCode.value}`);
      console.log(res.data)
      if (res.data.code === 0) {
        // 登录成功，保存 token 并跳转
        localStorage.setItem('staffToken', authCode.value);
        staffToken.value = authCode.value;
        clearInterval(timer.value);
      }
    } catch (err) {
      clearInterval(timer.value);
    }
  }, 2000);
}
function switchLanguage() {
  locale.value = selectedLanguage.value;
}

function formatTime(timeStr) {
  const date = new Date(timeStr);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? '上午' : '下午';
  const hour12 = hours % 12 || 12;
  return `${period} ${hour12}:${minutes}`;
}

function scrollToBottom() {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
}

function quickReply(text) {
  input.value = text;
}


</script>

<style scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.login-box {
  background: #fff;
  padding: 2rem 5rem;
  border-radius: 10px;
  text-align: center;
}

.login-box p{
  margin-top: 20px;
}

.login-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #2aabee;
  color: #fff;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 20px;
}
.msg-time {
  margin-top: 4px;
  padding: 0 8px;
  margin-left: 20px;
}
.time-left {
  text-align: right;
  color: #888888;
}
.time-right {
  text-align: right;
  color: #6db566;
}
.chat-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 左侧栏 */
.sidebar {
  width: 3%;
  background: #293a4c;
  backdrop-filter: blur(6px);
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  color: #8393a3;
}


.module-switch div {
  padding: 14px 16px;
  cursor: pointer;
  text-align: center;
}
.module-switch div.active {
  background: #17212b;
  color: #5eb5f7;
  font-weight: bold;
}

/* 右侧整体容器 */
.chat-wrapper {
  flex: 1;
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  overflow: hidden;
  flex-direction: column;
}

/* 聊天模块整体布局：好友列表 + 主聊天 + 工具栏 */
.chat-main-wrapper {
  flex: 1;
  display: flex;
  height: 100%;
}

/* 好友列表 */
.session-list {
  width: 220px;
  overflow-y: auto;
  border-right: 1px solid #ccc;
  background: #fff;
}
.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar.placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ccc;
}

.session-item:hover {
  background: #f1f1f1;
}
.session-item.active {
  background: #419fd9;
  font-weight: bold;
  color:#fff;
}

/* 聊天主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 20px;
  background: #ffffffcc;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(45deg, #c3cf8c, #95bd86);
}
.chat-line {
  display: flex;
  max-width: 100%;
}
.left {
  justify-content: flex-start;
}
.text-left {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #ffffff;
  color: #333;
}
.right {
  justify-content: flex-end;
}
.text-right{
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);

  background: #effdde;
  color: #000;
  border: 1px solid #a3d3ff;

}
.border-5{
  padding: 10px 14px;

  font-size: 22px;
  line-height: 1.5;
  border-radius: 16px;
  border: 1px solid #e0e0e0;

}
.border{
  border-radius: 7px;
}
.chat-sticker{
  width: 80px;
  height: 80px;
}
.chat-footer {
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: center;
  justify-items: center;
  gap: 10px;
}
input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: none;
  font-size: 18px;
}

input:focus {
  outline: none;
}
button {
  padding: 10px 16px;
  border: none;
  background: #007aff;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #005fcc;
}

/* 工具栏 */
.tools-panel {
  width: 260px;
  background: #ffffffcc;
  backdrop-filter: blur(8px);
  border-left: 1px solid #ccc;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
.tool-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  padding: 16px;
}
.tool-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}
.tool-card ul {
  list-style: none;
}
.tool-card li {
  padding: 6px 0;
  cursor: pointer;
  color: #007aff;
}
.tool-card li:hover {
  text-decoration: underline;
}

/* 非聊天内容居中展示 */
.center-placeholder {
  padding: 40px;
  text-align: center;
  color: #555;
}
</style> 我把复制的图片粘贴过来，页面出现一个确认框，里面是我粘贴的图片 点击确认后发送图片 