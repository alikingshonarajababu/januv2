‎const axios = require("axios");
‎const fs = require("fs");
‎const path = require("path");
‎
‎// 🔒 HARD-LOCK CREDITS PROTECTION 🔒
‎function protectCredits(config) {
‎  if (config.credits !== "ARIF-BABU") {
‎    config.credits = "ARIF-BABU";
‎    throw new Error("❌ Credits are LOCKED by ARIF-BABU 🔥");
‎  }
‎}
‎
‎module.exports.config = {
‎  name: "ARIF-AI-BOT",
‎  version: "2.6.5",
‎  hasPermssion: 0,
‎  credits: "ARIF-BABU",
‎  description: "Exact Bot reply + AI chat (Pollinations POST)",
‎  commandCategory: "ai",
‎  usages: "bot",
‎  cooldowns: 2,
‎  dependencies: { axios: "" }
‎};
‎
‎protectCredits(module.exports.config);
‎
‎// 📁 PATHS
‎const BASE_DIR = path.join(__dirname, "ARIF-BABU");
‎const HISTORY_FILE = path.join(BASE_DIR, "ai_history.json");
‎const BOT_REPLY_FILE = path.join(BASE_DIR, "bot-reply.json");
‎
‎// 📁 ENSURE DIR
‎if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });
‎
‎// 🧠 LOAD HISTORY
‎let historyData = fs.existsSync(HISTORY_FILE)
‎  ? JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"))
‎  : {};
‎
‎// 🤖 LOAD BOT REPLIES
‎let botReplies = fs.existsSync(BOT_REPLY_FILE)
‎  ? JSON.parse(fs.readFileSync(BOT_REPLY_FILE, "utf8"))
‎  : {};
‎
‎// 🌸 SYSTEM PROMPT
‎const systemPrompt = `
‎You are Romeo AI.
‎Creator & Owner: Romeo only.
‎
‎Rules:
‎• User jis language mein bole, usi language mein jawab do.
‎• English, aur Roman Urdu dono allowed.
‎• Ekdam masti aur boyfriend-style mein baat karo.
‎• Tum Pakistan se ho.
‎• Shayari ya joke bole to short aur cute ho.
‎• Reply sirf 1–2 lines ka ho.
‎• Emojis use karo 🙂❤️😌
‎• Agar koi bole "AI bolo" toh jawab ho:
‎  "Main Romeo AI hoon 🙂❤️😌"
‎`;
‎
‎module.exports.run = () => {};
‎
‎module.exports.handleEvent = async function ({ api, event }) {
‎  protectCredits(module.exports.config);
‎
‎  const { threadID, messageID, senderID, body, messageReply } = event;
‎  if (!body) return;
‎
‎  const rawText = body.trim();
‎  const text = rawText.toLowerCase();
‎
‎  // 🟢 FIXED BOT CONDITIONS
‎  const fixedBot =
‎    text === "bot" ||
‎    text === "bot." ||
‎    text === "bot!" ||
‎    text.endsWith(" bot");
‎
‎  const botWithText = text.startsWith("bot ");
‎  const replyToBot =
‎    messageReply &&
‎    messageReply.senderID === api.getCurrentUserID();
‎
‎  // =========================
‎  // 🤖 FIXED BOT REPLY
‎  // =========================
‎  if (fixedBot && !botWithText) {
‎    let category = "MALE";
‎
‎    if (senderID === "61572909482910") {
‎      category = "61572909482910";
‎    } else if (
‎      event.userGender === 1 ||
‎      event.userGender?.toString().toUpperCase() === "FEMALE"
‎    ) {
‎      category = "FEMALE";
‎    }
‎
‎    const replies = botReplies[category] || [];
‎    if (replies.length) {
‎      const reply = replies[Math.floor(Math.random() * replies.length)];
‎      api.sendMessage(reply, threadID, messageID);
‎      api.setMessageReaction("✅", messageID, () => {}, true);
‎    }
‎    return;
‎  }
‎
‎  // ❌ AI sirf tab chale:
‎  if (!botWithText && !replyToBot) return;
‎
‎  // =========================
‎  // 🧠 HISTORY
‎  // =========================
‎  if (!historyData[senderID]) historyData[senderID] = [];
‎
‎  historyData[senderID].push({
‎    role: "user",
‎    content: rawText
‎  });
‎
‎  if (historyData[senderID].length > 6)
‎    historyData[senderID].shift();
‎
‎  fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2));
‎
‎  api.setMessageReaction("⌛", messageID, () => {}, true);
‎
‎  // =========================
‎  // 🤖 AI POST REQUEST (FIXED)
‎  // =========================
‎  let res;
‎  try {
‎    res = await axios.post(
‎      "https://text.pollinations.ai/openai",
‎      {
‎        messages: [
‎          { role: "system", content: systemPrompt },
‎          ...historyData[senderID]
‎        ]
‎      },
‎      {
‎        headers: { "Content-Type": "application/json" },
‎        timeout: 30000
‎      }
‎    );
‎  } catch {
‎    return api.sendMessage(
‎      "Thoda sa ruk jao 😌 Abhi soch Raha hu ❤️",
‎      threadID,
‎      messageID
‎    );
‎  }
‎
‎  let reply =
‎    res.data?.choices?.[0]?.message?.content ||
‎    "main yahi hu 🙂❤️😌";
‎
‎  reply = reply.split("\n").slice(0, 2).join(" ");
‎  if (reply.length > 150)
‎    reply = reply.slice(0, 150) + "… 🙂";
‎
‎  historyData[senderID].push({
‎    role: "assistant",
‎    content: reply
‎  });
‎
‎  fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2));
‎
‎  api.sendTypingIndicator(threadID, true);
‎  await new Promise(r => setTimeout(r, 1200));
‎  api.sendTypingIndicator(threadID, false);
‎
‎  api.sendMessage(reply, threadID, messageID);
‎  api.setMessageReaction("✅", messageID, () => {}, true);
‎};