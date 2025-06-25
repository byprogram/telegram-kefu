<template>
  <!-- 登录弹窗 -->
  <div class="login-modal" v-if="!staffToken">
    <div class="login-box">
      <h3>登录</h3>
      <p>点击下方按钮授权</p>
      <button class="login-button" @click="handleLogin">一键登录 Telegram</button>
    </div>
  </div>

  <!-- 主聊天容器 -->
  <div class="chat-container">
    <!-- 左侧功能栏 -->
    <div class="sidebar">
      <div class="module-switch">
        <div :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">💬<p>聊天</p></div>
        <div :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">⚙️<p>设置</p></div>
        <div :class="{ active: activeTab === 'other' }" @click="activeTab = 'other'">📁<p>其他</p></div>
      </div>
    </div>

    <!-- 主体区域动态组件渲染 -->
    <component :is="activeComponent" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

// 组件导入
import Chat from './components/Chat.vue';
import Other from './components/Other.vue';
import Settings from './components/Settings.vue';

// 多语言
const { t, locale } = useI18n();

// 登录状态
const staffToken = ref(localStorage.getItem('staffToken') || null);
const authCode = ref('');
const timer = ref(null);

// 页面切换
const activeTab = ref('chat');
const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'chat': return Chat;
    case 'settings': return Settings;
    default: return Other;
  }
});

// 粘贴预览
const showImagePreview = ref(false);
const pastedFile = ref('');
const pastedFileType = ref('photo');

// 登录逻辑
const API_BASE_URL = 'http://localhost:3000/api';

async function handleLogin() {
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
      if (res.data.code === 0) {
        localStorage.setItem('staffToken', authCode.value);
        staffToken.value = authCode.value;
        clearInterval(timer.value);
      }
    } catch (err) {
      clearInterval(timer.value);
    }
  }, 2000);
}

// 图片预览控制方法（留空实现，可在外部赋值）
function cancelSendImage() {
  showImagePreview.value = false;
}
function confirmSendImage() {
  showImagePreview.value = false;
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
.login-box p {
  margin-top: 20px;
}
.login-button {
  padding: 0.5rem 1rem;
  background: #2aabee;
  color: #fff;
  border-radius: 5px;
  margin-top: 20px;
}

/* 主体区域 */
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
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  color: #8393a3;
}
.module-switch div {
  padding: 14px 0;
  cursor: pointer;
  text-align: center;
}
.module-switch div.active {
  background: #17212b;
  color: #5eb5f7;
  font-weight: bold;
}

/* 粘贴预览 */
.image-preview-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; 
  justify-content: center; 
  align-items: center;
  z-index: 1000;
}
.preview-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
.preview-bg {
  margin: 10px 0;
}
.preview-img {
  max-width: 400px;
  max-height: 400px;
  border-radius: 10px;
}
.preview-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}
.preview-actions div {
  cursor: pointer;
  padding: 8px 16px;
  background: #2aabee;
  color: white;
  border-radius: 5px;
}
</style>
