"use strict";

(() => {
  const STORAGE_KEY = "chatMessages";
  const BOT_DELAY_MIN = 500;
  const BOT_DELAY_MAX = 1000;

  const chatBox = document.getElementById("chatBox");
  const emptyState = document.getElementById("emptyState");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const clearBtn = document.getElementById("clearBtn");

  const RESPONSES = [
    { keywords: ["hello", "hi", "hey"], reply: "Hey!  How can I help you?" },
    { keywords: ["how are you"], reply: "I'm doing great! Thanks for asking." },
    { keywords: ["help"], reply: "Sure! You can ask me about the available commands." },
    { keywords: ["bye", "goodbye"], reply: "Goodbye!  Have a great day!" },
    { keywords: ["thanks", "thank you"], reply: "You're welcome! " },
  ];
  const DEFAULT_REPLY = "I'm still learning. Try asking me something else! 🤖";

  let messages = [];

  // Storage
  const loadMessages = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveMessages = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn("Could not save chat history:", err);
    }
  };

  // ---------- Helpers ----------
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const getTimestamp = () => formatTime(new Date());

  const nextId = () => messages.reduce((max, m) => Math.max(max, m.id), 0) + 1;

  const scrollToBottom = () => {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
  };

  const updateEmptyState = () => {
    emptyState.hidden = messages.length > 0;
  };

  // ---------- Rendering ----------
  const renderMessage = ({ text, sender, timestamp }) => {
    const bubble = document.createElement("div");
    bubble.className = `message message--${sender === "user" ? "user" : "bot"}`;

    const body = document.createElement("span");
    body.className = "message__text";
    body.textContent = text;

    const time = document.createElement("time");
    time.className = "message__time";
    time.textContent = timestamp;

    bubble.append(body, time);
    chatBox.appendChild(bubble);
  };

  const renderAll = () => {
    chatBox.querySelectorAll(".message").forEach((el) => el.remove());
    messages.forEach(renderMessage);
    updateEmptyState();
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  // ---------- Chatbot ----------
  const generateBotResponse = (text) => {
    const clean = text.toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ").trim();
    const match = RESPONSES.find(({ keywords }) =>
      keywords.some((k) => (` ${clean} `).includes(` ${k} `))
    );
    return match ? match.reply : DEFAULT_REPLY;
  };

  const addMessage = (text, sender) => {
    const message = { id: nextId(), text, sender, timestamp: getTimestamp() };
    messages.push(message);
    saveMessages();
    renderMessage(message);
    updateEmptyState();
    scrollToBottom();
  };

  const sendMessage = (text) => {
    addMessage(text, "user");
    const delay = BOT_DELAY_MIN + Math.random() * (BOT_DELAY_MAX - BOT_DELAY_MIN);
    setTimeout(() => addMessage(generateBotResponse(text), "bot"), delay);
  };

  // ---------- Handlers ----------
  const handleSend = (event) => {
    event.preventDefault();
    const text = input.value.trim().replace(/\s+/g, " ");
    if (!text) {
      input.value = "";
      input.focus();
      return;
    }
    sendMessage(text);
    input.value = "";
    input.focus();
  };

  const clearChat = () => {
    if (!window.confirm("Clear the entire chat history? This can't be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    messages = [];
    renderAll();
    input.focus();
  };

  // ---------- Init ----------
  const init = () => {
    messages = loadMessages();
    renderAll();
    form.addEventListener("submit", handleSend); // handles Send click and Enter key
    clearBtn.addEventListener("click", clearChat);
    input.focus();
  };

  init();
})();
