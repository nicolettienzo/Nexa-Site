// chat-widget.js
// Widget de chat da Nexa Machine. Auto-contido: injeta seu próprio CSS e HTML,
// não depende de nenhuma biblioteca externa. Basta incluir este arquivo no
// site com <script src="chat-widget.js" defer></script> antes do </body>.
//
// Ele conversa com a serverless function em /api/chat (ver api/chat.js),
// que é quem efetivamente chama a API da Claude com a chave protegida.

(function () {
  'use strict';

  const STYLES = `
    #nexa-chat-toggle {
      position: fixed;
      bottom: 104px;
      right: 30px;
      z-index: 9998;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(135deg, #ff6a00, #ff8a1f);
      box-shadow: 0 8px 30px rgba(255,106,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .3s, box-shadow .3s;
    }
    #nexa-chat-toggle:hover { transform: scale(1.08); box-shadow: 0 12px 40px rgba(255,106,0,0.55); }
    #nexa-chat-toggle svg { width: 26px; height: 26px; }

    #nexa-chat-panel {
      position: fixed;
      bottom: 178px;
      right: 30px;
      z-index: 9999;
      width: 360px;
      max-width: calc(100vw - 40px);
      height: 520px;
      max-height: calc(100vh - 220px);
      background: #050505;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,106,0,0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      opacity: 0;
      transform: translateY(16px) scale(.97);
      pointer-events: none;
      transition: opacity .25s ease, transform .25s ease;
    }
    #nexa-chat-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    #nexa-chat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      background: rgba(255,106,0,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    #nexa-chat-avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff6a00, #ff8a1f);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #nexa-chat-avatar svg { width: 20px; height: 20px; }
    #nexa-chat-title { color: #fff; font-weight: 700; font-size: .95rem; line-height: 1.3; }
    #nexa-chat-subtitle { color: #a9a9a9; font-size: .75rem; }
    #nexa-chat-close {
      margin-left: auto;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 50%;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #a9a9a9;
      flex-shrink: 0;
      transition: .2s;
    }
    #nexa-chat-close:hover { color: #fff; border-color: rgba(255,106,0,0.3); }

    #nexa-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #nexa-chat-messages::-webkit-scrollbar { width: 6px; }
    #nexa-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

    .nexa-msg {
      max-width: 84%;
      padding: 11px 15px;
      border-radius: 16px;
      font-size: .87rem;
      line-height: 1.55;
      word-wrap: break-word;
    }
    .nexa-msg.bot {
      align-self: flex-start;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      color: #eaeaea;
      border-bottom-left-radius: 4px;
    }
    .nexa-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #ff6a00, #ff8a1f);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .nexa-msg.error {
      align-self: flex-start;
      background: rgba(255,80,80,0.08);
      border: 1px solid rgba(255,80,80,0.25);
      color: #ff9b9b;
      border-bottom-left-radius: 4px;
    }

    #nexa-chat-typing {
      align-self: flex-start;
      display: none;
      gap: 4px;
      padding: 13px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      border-bottom-left-radius: 4px;
    }
    #nexa-chat-typing.show { display: flex; }
    #nexa-chat-typing span {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #ff8a1f;
      animation: nexaTypingBounce 1.2s infinite ease-in-out;
    }
    #nexa-chat-typing span:nth-child(2) { animation-delay: .15s; }
    #nexa-chat-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes nexaTypingBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: .5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    #nexa-chat-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 18px 14px;
      flex-shrink: 0;
    }
    .nexa-suggestion {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      color: #d8d8d8;
      font-size: .76rem;
      padding: 7px 13px;
      border-radius: 999px;
      cursor: pointer;
      transition: .2s;
      white-space: nowrap;
    }
    .nexa-suggestion:hover { border-color: rgba(255,106,0,0.4); color: #fff; background: rgba(255,106,0,0.08); }

    #nexa-chat-inputbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px;
      border-top: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    #nexa-chat-input {
      flex: 1;
      background: #0b0b0b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 999px;
      padding: 11px 16px;
      color: #fff;
      font-size: .87rem;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color .2s;
    }
    #nexa-chat-input::placeholder { color: #6b6b6b; }
    #nexa-chat-input:focus { border-color: rgba(255,106,0,0.4); }
    #nexa-chat-send {
      width: 38px; height: 38px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #ff6a00, #ff8a1f);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform .2s, opacity .2s;
    }
    #nexa-chat-send:hover { transform: scale(1.08); }
    #nexa-chat-send:disabled { opacity: .5; cursor: default; transform: none; }
    #nexa-chat-send svg { width: 16px; height: 16px; }

    @media (max-width: 480px) {
      #nexa-chat-panel { right: 16px; left: 16px; width: auto; bottom: 168px; }
      #nexa-chat-toggle { right: 20px; }
    }
  `;

  const ICON_CHAT = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
  const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="#a9a9a9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
  const ICON_SEND = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;

  const GREETING = 'Olá! 👋 Posso te ajudar com informações sobre nossas máquinas CNC, prazos de entrega, garantia ou orçamentos. Como posso ajudar?';
  const SUGGESTIONS = ['Prazo de entrega', 'Garantia das máquinas', 'Quero um orçamento'];
  const ERROR_FALLBACK = 'Tive um problema para responder agora. Você pode falar direto com nosso time pelo WhatsApp: (19) 98806-6290.';

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function init() {
    const styleTag = document.createElement('style');
    styleTag.textContent = STYLES;
    document.head.appendChild(styleTag);

    const toggle = document.createElement('button');
    toggle.id = 'nexa-chat-toggle';
    toggle.setAttribute('aria-label', 'Abrir chat de atendimento');
    toggle.innerHTML = ICON_CHAT;

    const panel = document.createElement('div');
    panel.id = 'nexa-chat-panel';
    panel.innerHTML = `
      <div id="nexa-chat-header">
        <div id="nexa-chat-avatar">${ICON_CHAT}</div>
        <div>
          <div id="nexa-chat-title">Assistente Nexa</div>
          <div id="nexa-chat-subtitle">Tira dúvidas sobre máquinas CNC</div>
        </div>
        <div id="nexa-chat-close" aria-label="Fechar chat">${ICON_CLOSE}</div>
      </div>
      <div id="nexa-chat-messages"></div>
      <div id="nexa-chat-suggestions"></div>
      <div id="nexa-chat-inputbar">
        <input id="nexa-chat-input" type="text" placeholder="Digite sua pergunta..." autocomplete="off">
        <button id="nexa-chat-send" aria-label="Enviar mensagem">${ICON_SEND}</button>
      </div>
    `;

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    const messagesEl = panel.querySelector('#nexa-chat-messages');
    const suggestionsEl = panel.querySelector('#nexa-chat-suggestions');
    const inputEl = panel.querySelector('#nexa-chat-input');
    const sendBtn = panel.querySelector('#nexa-chat-send');
    const closeBtn = panel.querySelector('#nexa-chat-close');

    let history = [];
    let isOpen = false;
    let isSending = false;

    function addMessage(role, text) {
      const el = document.createElement('div');
      el.className = 'nexa-msg ' + role;
      el.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setTyping(show) {
      let typingEl = messagesEl.querySelector('#nexa-chat-typing');
      if (show) {
        if (!typingEl) {
          typingEl = document.createElement('div');
          typingEl.id = 'nexa-chat-typing';
          typingEl.innerHTML = '<span></span><span></span><span></span>';
          messagesEl.appendChild(typingEl);
        }
        typingEl.classList.add('show');
        messagesEl.scrollTop = messagesEl.scrollHeight;
      } else if (typingEl) {
        typingEl.remove();
      }
    }

    function renderSuggestions() {
      suggestionsEl.innerHTML = '';
      SUGGESTIONS.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'nexa-suggestion';
        chip.textContent = text;
        chip.addEventListener('click', () => sendMessage(text));
        suggestionsEl.appendChild(chip);
      });
    }

    async function sendMessage(text) {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      suggestionsEl.innerHTML = '';
      addMessage('user', trimmed);
      history.push({ role: 'user', content: trimmed });
      inputEl.value = '';
      isSending = true;
      sendBtn.disabled = true;
      setTyping(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });

        const data = await response.json();
        setTyping(false);

        if (!response.ok || !data.reply) {
          addMessage('error', ERROR_FALLBACK);
        } else {
          addMessage('bot', data.reply);
          history.push({ role: 'assistant', content: data.reply });
        }
      } catch (err) {
        setTyping(false);
        addMessage('error', ERROR_FALLBACK);
      } finally {
        isSending = false;
        sendBtn.disabled = false;
        inputEl.focus();
      }
    }

    function openPanel() {
      isOpen = true;
      panel.classList.add('open');
      if (messagesEl.children.length === 0) {
        addMessage('bot', GREETING);
        renderSuggestions();
      }
      inputEl.focus();
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('open');
    }

    toggle.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
    closeBtn.addEventListener('click', closePanel);
    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage(inputEl.value);
      if (e.key === 'Escape') closePanel();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();