<template>
  <div class="settings-wrapper">
    <div class="settings-sidebar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['sidebar-item', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ t(tab.label) }}
      </div>
    </div>

    <div class="settings-content">
      <!-- 语言设置 -->
      <div v-if="activeTab === 'language'">
        <h2>{{ t('settings.language') }}</h2>
        <div class="setting-item">
          <label>{{ t('settings.language') }}</label>
          <select v-model="selectedLanguage" @change="switchLanguage">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 通知设置 -->
      <div v-else-if="activeTab === 'notifications'">
        <h2>{{ t('settings.notifications') }}</h2>
        <div class="setting-item">
          <input type="checkbox" v-model="settings.sound" />
          <label>{{ t('settings.sound') }}</label>
        </div>
        <div class="setting-item">
          <input type="checkbox" v-model="settings.popup" />
          <label>{{ t('settings.popup') }}</label>
        </div>
      </div>

      <!-- 快捷回复设置 -->
      <div v-else-if="activeTab === 'quickReplies'">
        <h2>{{ t('settings.quickReplies') }}</h2>

        <!-- 切换回复类型 -->
        <div class="setting-item">
          <label>{{ t('settings.replyType') }}</label>
          <select v-model="replyType" @change="fetchQuickReplies">
            <option value="text">{{ t('settings.text') }}</option>
            <option value="photo">{{ t('settings.photo') }}</option>
            <option value="video">{{ t('settings.video') }}</option>
          </select>
        </div>

        <!-- 快捷回复列表 -->
        <div class="quick-replies-list">
          <div
            class="quick-reply-item"
            v-for="reply in quickReplies"
            :key="reply.id"
          >
            <template v-if="reply.message_type === 'text'">
              <input
                v-model="reply.content"
                @change="updateQuickReply(reply)"
                type="text"
                placeholder="快捷回复内容"
              />
            </template>
            <template v-else>
              <input
                v-model="reply.file_url"
                @change="updateQuickReply(reply)"
                type="text"
                placeholder="文件 URL"
              />
            </template>
            <button class="delete-btn" @click="deleteQuickReply(reply.id)">删除</button>
          </div>
          <button class="add-btn" @click="addQuickReply">{{ t('settings.addQuickReply') }}</button>
        </div>
      </div>

      <!-- 客服账号设置 -->
      <div v-else-if="activeTab === 'staff'">
        <h2>{{ t('settings.staffAccounts') }}</h2>

        <div class="staff-list">
          <div class="staff-item" v-for="account in staffAccounts" :key="account.id">
            <input
              v-model="account.telegram_id"
              placeholder="Telegram ID"
              @change="updateStaffAccount(account)"
            />
            <select v-model="account.role" @change="updateStaffAccount(account)">
              <option value="admin">{{ t('settings.admin') }}</option>
              <option value="staff">{{ t('settings.staff') }}</option>
            </select>
            <button class="delete-btn" @click="deleteStaffAccount(account.id)">{{ t('settings.delete') }}</button>
            <button class="save-btn" @click="deleteStaffAccount(account.id)">{{ t('settings.save') }}</button>
          </div>
          <button class="add-btn" @click="addStaffAccount">{{ t('settings.addStaff') }}</button>
        </div>
      </div>

      <!-- 系统设置 -->
      <div v-else-if="activeTab === 'system'">
        <h2>{{ t('settings.system') }}</h2>
        <div class="setting-item">
          <label>Bot Token</label>
          <input type="text" v-model="settings.botToken" />
        </div>
        <div class="setting-item">
          <label>Bot Username</label>
          <input type="text" v-model="settings.botUsername" />
        </div>
        <div class="setting-item">
          <label>{{ t('settings.groupId') }}</label>
          <input type="text" v-model="settings.groupId" />
        </div>
        <button class="add-btn" @click="saveSettings">{{ t('settings.save') }}</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const activeTab = ref('language')
const selectedLanguage = ref(locale.value)

const tabs = [
  { key: 'language', label: 'settings.language' },
  { key: 'notifications', label: 'settings.notifications' },
  { key: 'quickReplies', label: 'settings.quickReplies' },
  { key: 'staff', label: 'settings.staffAccounts' },
  { key: 'system', label: 'settings.system' }
]

const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' }
]

const settings = reactive({
  sound: true,
  popup: true,
  botToken: '',
  groupId: '',
  botUsername: ''
})

// 快捷回复
const replyType = ref('text')
const quickReplies = ref([])

// 客服账号
const staffAccounts = ref([])

onMounted(() => {
  loadSettings()
  fetchQuickReplies()
  fetchStaffAccounts()
})

function switchLanguage() {
  locale.value = selectedLanguage.value
  localStorage.setItem('language', selectedLanguage.value)
}

async function loadSettings() {
  // TODO: 从接口获取设置
  // 这里示例数据
  Object.assign(settings, {
    sound: true,
    popup: true,
    botToken: 'YOUR_BOT_TOKEN',
    groupId: 'YOUR_GROUP_ID',
    botUsername: 'YourBotUsername'
  })
}

async function saveSettings() {
  // TODO: 调接口保存所有设置，包括快捷回复和客服账号
  alert(t('settings.saved'))
}

// 快捷回复相关接口模拟

async function fetchQuickReplies() {
  try {
    // TODO: 用接口获取快捷回复数据，带 replyType 过滤
    // 示例假数据
    const data = [
      { id: 1, message_type: replyType.value, content: replyType.value === 'text' ? '示例文本' : '', file_url: replyType.value !== 'text' ? 'https://example.com/file.png' : '' }
    ]
    quickReplies.value = data
  } catch (e) {
    console.error(e)
  }
}

async function addQuickReply() {
  quickReplies.value.push({
    id: Date.now(),
    message_type: replyType.value,
    content: '',
    file_url: ''
  })
}

async function updateQuickReply(reply) {
  // TODO: 调接口保存单条快捷回复
  console.log('update quick reply', reply)
}

async function deleteQuickReply(id) {
  // TODO: 调接口删除快捷回复
  quickReplies.value = quickReplies.value.filter(r => r.id !== id)
}

// 客服账号相关

async function fetchStaffAccounts() {
  try {
    // TODO: 调接口获取客服账号列表
    const data = [
      { id: 1, telegram_id: '123456789', role: 'admin' },
      { id: 2, telegram_id: '987654321', role: 'staff' }
    ]
    staffAccounts.value = data
  } catch (e) {
    console.error(e)
  }
}

async function addStaffAccount() {
  staffAccounts.value.push({
    id: Date.now(),
    telegram_id: '',
    role: 'staff'
  })
}

async function updateStaffAccount(account) {
  // TODO: 调接口更新账号信息
  console.log('update staff account', account)
}

async function deleteStaffAccount(id) {
  // TODO: 调接口删除账号
  staffAccounts.value = staffAccounts.value.filter(a => a.id !== id)
}
</script>

<style scoped>
.settings-wrapper {
  width: 50%;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.settings-sidebar {
  width: 200px;
  background-color: #f3f3f3;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
}

.sidebar-item {
  padding: 0.8rem 1rem;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  color: #333;
  transition: background-color 0.2s;
  user-select: none;
}

.sidebar-item.active,
.sidebar-item:hover {
  background-color: #2aabee;
  color: white;
}

.settings-content {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
  min-height: 480px;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.setting-item label {
  flex-shrink: 0;
  margin-right: 0.5rem;
  font-weight: 500;
}

.setting-item input,
.setting-item select,
.setting-item textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #f8f9fa;
  transition: border-color 0.2s;
}

.setting-item input[type='checkbox'] {
  width: auto;
  height: 1.2em;
  vertical-align: middle;
  background-color: white;
  cursor: pointer;
}

.setting-item input:focus,
.setting-item select:focus,
.setting-item textarea:focus {
  border-color: #2aabee;
  background-color: #fff;
  outline: none;
}

/* 通用按钮基础样式 */
button {
  font-size: 0.95rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  border: none;
  transition: background-color 0.3s ease;
}

/* 保存按钮：蓝色 */
.save-btn {
  background-color: #fff;
  color: #2aabee;
  border: solid 1px #2aabee;
}

.save-btn:hover {
  background-color: #229bdc;
  color: #fff;
}

/* 删除按钮：红色 */
.delete-btn {
  background-color: #fff;
  color: #ff4d4f;
  border: solid 1px #ff4d4f;
}

.delete-btn:hover {
  background-color: #ff4d4f;
  color: #fff;
}

/* 添加按钮：镂空蓝白色 */
.add-btn {
  margin-top: 0.5rem;
  background-color: #2aabee;
  color: #fff;
  border: solid 1px #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #229bdc;
  color: #fff;
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem 2rem 0.5rem 0.8rem;
  font-size: 1rem;
  color: #333;
  background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

/* 快捷回复列表 */
.quick-replies-list {
  margin-top: 1rem;
}

.quick-reply-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.quick-reply-item input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}

/* 客服账号列表 */
.staff-list {
  margin-top: 1rem;
}

.staff-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.staff-item input {
  flex: 2;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}

.staff-item select {
  flex: 1;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
  padding: 0.3rem 0.5rem;
}

.staff-item button {
  border-radius: 8px;
  padding: 0 0.8rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

/* 隐藏原生多选框 */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 26px;
  height: 26px;
  border: 2px solid #2aabee;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

/* 放大1.3倍 */
.setting-item input[type="checkbox"] {
  transform-origin: center center;
  margin-right: 0.5rem;
  cursor: pointer;
}

/* 选中状态 */
input[type="checkbox"]:checked {
  background-color: #2aabee;
  border-color: #2aabee;
}

/* 打勾标记 */
input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 7px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
