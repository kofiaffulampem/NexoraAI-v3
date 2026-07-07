// ==========================================
// Nexora AI v5
// Chat Engine
// Part 1
// ==========================================

// Markdown Configuration
marked.setOptions({
    gfm: true,
    breaks: true
});

// ==========================================
// Global State
// ==========================================

let conversations =
    JSON.parse(localStorage.getItem("conversations")) || [];

let currentChat = null;

// ==========================================
// DOM Elements
// ==========================================

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const history = document.getElementById("history");
const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");

// ==========================================
// Save Conversations
// ==========================================

function saveConversations() {

    localStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
    );

}

// ==========================================
// Render Sidebar
// ==========================================

function renderHistory() {

    history.innerHTML = "";

    conversations.forEach(chat => {

        const item = document.createElement("div");

        item.className = "chat-item";

        item.textContent = chat.title;

        item.onclick = () => {

            loadConversation(chat.id);

        };

        history.appendChild(item);

    });

}

// ==========================================
// Create New Chat
// ==========================================

function createNewChat() {

    currentChat = Date.now();

    conversations.unshift({

        id: currentChat,

        title: "New Chat",

        messages: []

    });

    saveConversations();

    renderHistory();

    chatBox.innerHTML = "";

}

// ==========================================
// Load Conversation
// ==========================================

function loadConversation(id) {

    currentChat = id;

    const chat =
        conversations.find(c => c.id === id);

    if (!chat) return;

    chatBox.innerHTML = "";

    chat.messages.forEach(msg => {

        addMessage(
            msg.sender,
            msg.text
        );

    });

}

// ==========================================
// Add Message
// ==========================================

function addMessage(sender, text) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        sender === "user"
            ? "message-wrapper user-wrapper"
            : "message-wrapper";

    const avatar =
        document.createElement("img");

    avatar.className = "avatar";

    avatar.src =
        sender === "user"
            ? "/images/user.png"
            : "/images/bot.jpeg";

    const bubble =
        document.createElement("div");

    bubble.className =
        sender === "user"
            ? "user-bubble"
            : "ai-bubble";

    if (sender === "ai") {

        bubble.innerHTML =
            marked.parse(text);

        if (typeof hljs !== "undefined") {

            bubble.querySelectorAll("pre code")
                .forEach(block => {

                    hljs.highlightElement(block);

                });

        }

    } else {

        bubble.textContent = text;

    }

    if (sender === "user") {

        wrapper.appendChild(bubble);
        wrapper.appendChild(avatar);

    } else {

        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);

    }

    chatBox.appendChild(wrapper);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    return bubble;

}
// ==========================================
// Send Message
// ==========================================

async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    sendBtn.disabled = true;
    sendBtn.textContent = "Thinking...";

    if (currentChat === null) {

        createNewChat();

    }

    const chat =
        conversations.find(c => c.id === currentChat);

    addMessage("user", text);

    chat.messages.push({

        sender: "user",

        text: text

    });

    if (chat.title === "New Chat") {

        chat.title = text.substring(0, 40);

        renderHistory();

    }

    saveConversations();

    input.value = "";

    input.style.height = "auto";

    // Thinking animation

    const typing = addMessage(
        "ai",
        `<div class="thinking">
            <span></span>
            <span></span>
            <span></span>
        </div>`
    );

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                message: text,

                history: chat.messages.map(m => ({

                    role:
                        m.sender === "user"
                            ? "user"
                            : "assistant",

                    content: m.text

                }))

            })

        });

        if (!response.ok) {

            throw new Error("Server Error");

        }

        const data = await response.json();

        typing.innerHTML = marked.parse(
            data.reply || "No response received."
        );

        // Highlight code

        if (typeof hljs !== "undefined") {

            typing.querySelectorAll("pre code")
                .forEach(block => {

                    hljs.highlightElement(block);

                });

        }

        // Copy button

        const copyBtn =
            document.createElement("button");

        copyBtn.className = "copy-btn";

        copyBtn.textContent = "📋 Copy";

        copyBtn.onclick = async () => {

            await navigator.clipboard.writeText(
                data.reply
            );

            copyBtn.textContent = "✅ Copied";

            setTimeout(() => {

                copyBtn.textContent = "📋 Copy";

            }, 2000);

        };

        typing.prepend(copyBtn);

        chat.messages.push({

            sender: "ai",

            text: data.reply

        });

        saveConversations();

    }

    catch (error) {

        console.error(error);

        typing.innerHTML = marked.parse(

`# Connection Error

Unable to contact Nexora AI.

Please try again.`

        );

    }

    finally {

        sendBtn.disabled = false;

        sendBtn.textContent = "Send";

    }

}
// ==========================================
// Initialize Chat
// ==========================================

function initializeChat() {

    renderHistory();

    if (conversations.length > 0) {

        loadConversation(conversations[0].id);

    } else {

        createNewChat();

        addMessage(
            "ai",
`# 👋 Welcome to Nexora AI

I'm *Nexora AI, your intelligent AI assistant created by **Kofi Afful Ampem*.

### I can help you with

- 💻 Programming
- 📖 Bible Study
- 📊 Business
- ✍️ Writing
- 🧮 Mathematics
- 🌍 General Knowledge
- 💡 Creative Ideas

How can I help you today?`
        );

    }

}

// ==========================================
// Events
// ==========================================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

// ==========================================
// Auto Resize
// ==========================================

input.addEventListener("input", () => {

    input.style.height = "auto";

    input.style.height = input.scrollHeight + "px";

});

// ==========================================
// Sidebar Buttons
// ==========================================

newChatBtn.addEventListener("click", () => {

    createNewChat();

    addMessage(
        "ai",
`# 👋 New Chat

What would you like to work on today?`
    );

});

clearBtn.addEventListener("click", () => {

    if (!confirm("Delete all conversations?")) {

        return;

    }

    conversations = [];

    currentChat = null;

    localStorage.removeItem("conversations");

    history.innerHTML = "";

    chatBox.innerHTML = "";

    createNewChat();

    addMessage(
        "ai",
`# 👋 Welcome

All conversations have been deleted.

How can I help you today?`
    );

});

// ==========================================
// Export
// ==========================================

window.initializeChat = initializeChat;