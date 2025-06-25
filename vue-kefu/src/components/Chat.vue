<template>
  <!-- 粘贴图片/视频预览弹窗 -->
  <div class="image-preview-modal" v-if="showImagePreview">
    <div class="preview-box">
      <h3>发送{{ pastedFileType === 'photo' ? '图片' : '视频' }}</h3>
      <div class="preview-bg">
        <img v-if="pastedFileType === 'photo'" :src="pastedFile" class="preview-img" />
        <video v-else controls :src="pastedFile" class="preview-img" />
      </div>
      <div class="preview-actions">
        <div @click="cancelSendImage">取消</div>
        <div @click="confirmSendImage">发送</div>
      </div>
    </div>
  </div>

  <!-- 聊天主界面 -->
  <div class="chat-container">
    <div class="chat-wrapper">
      <!-- 会话列表 -->
      <div v-if="activeTab === 'chat'" class="chat-main-wrapper">
        <div class="session-list">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: session.id === currentSessionId }"
            @click="selectSession(session.id, session.nickname)"
          >
            <img
              v-if="session.avatar_base64"
              :src="session.avatar_base64"
              alt="头像"
              class="avatar"
            />
            <div v-else class="avatar placeholder"></div>
            <div>
              <div>{{ session.nickname }}</div>
              <div
                :style="{ color: session.id === currentSessionId ? '#fff' : '#bbbbbb' }"
                style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;"
              >
                {{ session.last_message }}
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="chat-main">
          <div class="chat-header">
            <span>{{ currentSessionNickname }}</span>
          </div>

          <!-- 消息内容 -->
          <div class="chat-body" ref="chatBody">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="chat-line"
              :class="msg.sender_type === 0 ? 'left' : 'right'"
            >
              <div class="bubble">
                <template v-if="msg.message_type === 'text'">
                  <div class="border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'">
                    <div class="msg-text">{{ msg.content }}</div>
                    <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">
                      {{ formatTime(msg.sent_at) }}
                    </div>
                  </div>
                </template>

                <template v-else-if="msg.message_type === 'photo'">
                  <img :src="msg.file_url" alt="图片" class="border" style="width: 300px;" />
                </template>

                <template v-else-if="msg.message_type === 'voice'">
                  <div class="border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'">
                    <audio controls :src="msg.file_url" />
                    <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">
                      {{ formatTime(msg.sent_at) }}
                    </div>
                  </div>
                </template>

                <template v-else-if="msg.message_type === 'video'">
                  <video controls :src="msg.file_url" class="chat-video" />
                </template>

                <template v-else-if="msg.message_type === 'document'">
                  <div class="border-5" :class="msg.sender_type === 0 ? 'text-left' : 'text-right'">
                    <a :href="msg.file_url" target="_blank">📎 下载文件</a>
                    <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">
                      {{ formatTime(msg.sent_at) }}
                    </div>
                  </div>
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
                  <span>
                    ❓ 暂不支持的消息类型{{ msg.content }}
                    <div class="msg-time" :class="msg.sender_type === 0 ? 'time-left' : 'time-right'">
                      {{ formatTime(msg.sent_at) }}
                    </div>
                  </span>
                </template>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-footer">
            <input
              v-model="input"
              ref="chatInput"
              @paste="handlePaste"
              :placeholder="t('inputPlaceholder')"
              @keyup.enter="sendMessage"
            />

            <!-- 文件上传 -->
            <input
              ref="fileInput"
              type="file"
              style="display: none;"
              @change="handleFileChange"
            />
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              class="emoji-btn"
              @click="triggerUpload"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" fill="#a6a6a6" />
            </svg>

            <!-- 发送按钮 -->
            <svg
              v-if="input"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="#4aace5"
              class="send-btn"
              @click="sendMessage"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>

        <!-- 工具栏 -->
        <div class="tools-panel">
          <div class="tool-card">
            <div class="reply-tabs">
              <div @click="setReplyType('text')" :class="{ active: replyType === 'text' }">文本</div>
              <div @click="setReplyType('image')" :class="{ active: replyType === 'image' }">图片</div>
              <div @click="setReplyType('video')" :class="{ active: replyType === 'video' }">视频</div>
            </div>

            <!-- 快捷回复 -->
            <ul v-if="replyType === 'text'">
              <li v-for="item in quickReplies" :key="item.id" @click="quickReply(item.content)">
                {{ item.content }}
              </li>
            </ul>
            <ul v-if="replyType === 'image'">
              <li v-for="item in quickReplies" :key="item.id" @click="quickReply(item.content)">
                <img :src="item.content" style="max-width: 100px;" />
              </li>
            </ul>
            <ul v-if="replyType === 'video'">
              <li v-for="item in quickReplies" :key="item.id" @click="quickReply(item.content)">
                <video :src="item.content" controls style="max-width: 120px;" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const API_BASE_URL = 'http://localhost:3000/api';
const WS_BASE_URL = 'ws://localhost:3000/ws';

// 状态定义
const activeTab = ref('chat');
const sessions = ref([]);
const currentSessionId = ref(null);
const currentSessionNickname = ref(null);
const messages = ref([]);
const input = ref('');
const replyType = ref('text');
const quickReplies = ref([]);

const chatBody = ref(null);
const fileInput = ref(null);
const pastedFile = ref(null);
const pastedFileType = ref('photo');
const showImagePreview = ref(false);

let socket = null;

// 生命周期钩子：初始化
onMounted(async () => {
  initWebSocket();
  await loadSessions();
  setReplyType('text');
});

// 初始化 WebSocket
function initWebSocket() {
  socket = new WebSocket(`${WS_BASE_URL}?staffToken=${localStorage.getItem('staffToken')}`);
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.sessionId === currentSessionId.value) {
      messages.value.push({
        sender_type: 0,
        content: data.content,
        message_type: data.message_type,
        file_url: data.file_url,
        sent_at: formatDateTime()
      });
    }
    sessions.value = data.sessionRows_new;
  };
}

// 加载会话列表
async function loadSessions() {
  try {
    const res = await axios.get(`${API_BASE_URL}/sessions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
    });
    sessions.value = res.data.data;
    if (sessions.value.length > 0) {
      selectSession(sessions.value[0].id, sessions.value[0].nickname);
    }
  } catch (e) {
    console.error('加载会话列表失败', e);
  }
}

// 切换当前会话
async function selectSession(sessionId, sessionNickname) {
  currentSessionId.value = sessionId;
  currentSessionNickname.value = sessionNickname;
  try {
    const res = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/messages`);
    messages.value = res.data.data;
    await nextTick(scrollToBottom);
  } catch (e) {
    console.error('加载消息失败', e);
  }
}

// 发送文本消息
function sendMessage() {
  const text = input.value.trim();
  if (!text || !currentSessionId.value) return;
  if (text.length > 500) return alert('消息内容过长，请限制在 500 字以内');

  axios.post(`${API_BASE_URL}/messages/send`, {
    session_id: currentSessionId.value,
    content: text,
    type: 'text'
  }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
  }).catch(err => console.error('发送失败', err));

  messages.value.push({
    id: Date.now(),
    sender_type: 1,
    content: text,
    message_type: 'text',
    sent_at: formatDateTime()
  });

  input.value = '';
  nextTick(scrollToBottom);
}

// 快捷回复
function quickReply(text) {
  input.value = text;
}

// 切换快捷回复类型
async function setReplyType(type) {
  replyType.value = type;
  try {
    const res = await axios.get(`${API_BASE_URL}/quick_replies?message_type=${type}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
    });
    quickReplies.value = res.data.data;
  } catch (e) {
    console.error('加载快捷回复失败', e);
  }
}

// 上传按钮点击
function triggerUpload() {
  fileInput.value?.click();
}

// 处理文件选择
async function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file || !currentSessionId.value) return;

  const fileType = file.type.startsWith('image') ? 'photo' :
                   file.type.startsWith('video') ? 'video' : 'file';

  const formData = new FormData();
  formData.append('session_id', currentSessionId.value);
  formData.append('type', fileType);
  formData.append('file', file);

  try {
    await axios.post(`${API_BASE_URL}/messages/send`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
    });

    const fileUrl = URL.createObjectURL(file);
    messages.value.push({
      id: Date.now(),
      sender_type: 1,
      message_type: fileType,
      file_url: fileUrl,
      sent_at: new Date()
    });

    nextTick(scrollToBottom);
  } catch (err) {
    console.error('上传并发送失败:', err);
  }
}

// 粘贴图片或视频
function handlePaste(event) {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
      const file = item.getAsFile();
      const reader = new FileReader();
        console.log(file)

      reader.onload = (e) => {
        pastedFile.value = e.target.result;
        pastedFileType.value = file.type.startsWith('image/') ? 'photo' : 'video';
        showImagePreview.value = true;
      };
      reader.readAsDataURL(file);
    }
  }
}

// 确认发送粘贴文件
async function confirmSendImage() {
  if (!pastedFile.value) return;

  const formData = new FormData();
  formData.append('session_id', currentSessionId.value);
  formData.append('type', pastedFileType.value);
  formData.append('content', pastedFile.value); // base64

  try {
    await axios.post(`${API_BASE_URL}/messages/send`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
    });

    messages.value.push({
      id: Date.now(),
      sender_type: 1,
      message_type: pastedFileType.value,
      file_url: pastedFile.value,
      sent_at: new Date()
    });

    showImagePreview.value = false;
    pastedFile.value = null;
    nextTick(scrollToBottom);
  } catch (err) {
    console.error('发送失败', err);
  }
}

// 取消发送粘贴内容
function cancelSendImage() {
  showImagePreview.value = false;
  pastedFile.value = null;
}

// 滚动到底部
function scrollToBottom() {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
}

// 时间格式化
function formatDateTime() {
  const date = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
       + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatTime(timeStr) {
  const date = new Date(timeStr);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? '上午' : '下午';
  const hour12 = hours % 12 || 12;
  return `${period} ${hour12}:${minutes}`;
}
</script>

<style scoped>
.image-preview-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; 
  justify-content: center; 
  align-items: center;
  z-index: 1000;
  font-size: 22px;
}
.preview-box {
  background: white; padding: 30px; border-radius: 12px; text-align: left;
  width: 25%;
}
.preview-bg{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f1f1f1;
  margin: 1em 0;
}
.preview-img {
  max-width: 500px; max-height: 500px; 
}
.preview-actions {
  display: flex;
  justify-content: end;
}
.preview-actions div {
  border-radius: 5px;
  padding: 5px 20px;
  background-color: #fff;
  color: #40a7e3;
  cursor: pointer;
}
.preview-actions div:hover{
  background-color:#e3f1fa;
}
.upload-box {
  width: 200px;
  padding: 10px;
  border: 2px dashed #aaa;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.upload-box:hover {
  border-color: #4aace5;
  background-color: #f0faff;
}
.msg-time {
  font-size: 17px;
  color: #999;
}
.time-left {
  align-self: flex-start;
  color: #888;
}
.time-right {
  align-self: flex-end;
  color: #6db566;
}
.chat-video{
  width: 200px;
  border-radius: 7px;
}
.chat-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  width: 280px;
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
  flex: 0.9;
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
/* 消息行 */
.chat-line {
  display: flex;
  max-width: 100%;
}
.left {
  justify-content: flex-start;
}
.right {
  justify-content: flex-end;
}
/* 消息气泡，左侧和右侧统一结构，时间显示在气泡内部 */
.text-left,
.text-right {
  max-width: 35vw;
  display: flex;
  flex-direction: column;
}
.text-left {
  background: #ffffff;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 10px 14px;
  word-break: break-word;
  white-space: pre-wrap;
}
.text-right {
  background: #effdde;
  color: #000;
  border: 1px solid #a3d3ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 10px 14px;
  word-break: break-word;
  white-space: pre-wrap;
}
.border-5 {
  font-size: 22px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
svg{
  cursor: pointer;
}
button:hover {
  background: #005fcc;
}
.tools-panel {
  flex: 0.2;
  background: #fff;
  border-radius: 8px;
  border-left: solid 1px #f1f1f1;
  width: 100%;
}
.tool-card {
  border-radius: 8px;
  background: #fff;
}
.tool-card h3 {
  margin-bottom: 0.5rem;
}
.reply-tabs {
  padding: 0.6rem 0.3rem;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  justify-content: space-around;
  border-bottom: solid 1px #f1f1f1;
}
.reply-tabs div {
  padding: 1rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}
.reply-tabs div.active {
  color: #40a7e3;
}
.tool-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #999999;
}
.tool-card li {
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.tool-card li:hover {
  background: #f0f0f0;
  color: #000;
}
.tool-card img,
.tool-card video {
  display: block;
  max-width: 100%;
  border-radius: 4px;
  cursor: pointer;
}
/* 非聊天内容居中展示 */
.center-placeholder {
  padding: 40px;
  text-align: center;
  color: #555;
}
</style>
