# 🤖 Telegram 客服系统

一个基于 **Node.js + Vue 3 + MySQL** 构建的 Telegram 客服系统，支持多客服实时接待、快捷回复、消息记录、WebSocket 通信和多语言切换，适用于虚拟商品销售、社群运营、客服外包等场景。

---

## 🧩 功能特性

- 🧑‍💼 多客服账号管理，权限分级
- 💬 实时双向聊天（WebSocket 推送）
- 🗂 快捷回复（支持文字 / 图片 / 视频）
- 📁 消息与会话记录永久保存（MySQL）
- 🌍 多语言界面支持（中 / 英等）
- 📦 部署简单，支持 Docker / Nginx / PM2

---

## 📐 技术架构

| 层级 | 技术栈 |
|------|--------|
| 前端 | Vue 3 + Element Plus |
| 后端 | Node.js + Express + WebSocket |
| Bot 接入 | [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) |
| 数据库 | MySQL |
| 部署 | Docker / Nginx / PM2 |

---

## 📸 系统截图

> _📌 以下为客服工作台示意图_

![工作台示意图](https://your-demo-image-link.com/screenshot.png)

---

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/your-org/telegram-customer-service.git

# 安装后端依赖
cd backend
npm install
cp .env.example .env
# 配置你的 Telegram Token 和数据库连接信息

# 启动后端
npm run dev

# 安装前端依赖
cd ../frontend
npm install

# 启动前端
npm run dev
