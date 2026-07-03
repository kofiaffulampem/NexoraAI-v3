// ==========================================
// Nexora AI Frontend
// Part 1
// ==========================================

// Markdown
marked.setOptions({
    breaks: true,
    gfm: true
});

// DOM Elements
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const button = document.getElementById("sendBtn");

const history = document.getElementById("history");
const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");

// Conversations
let conversations =
    JSON.parse(localStorage.getItem("conversations")) || [];

let currentChat = null;

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

        item.onclick = () => loadConversation(chat.id);

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

    chatBox.replaceChildren();

}

// ==========================================
// Load Conversation
// ==========================================

function loadConversation(id) {

    currentChat = id;

    const chat = conversations.find(c => c.id === id);

    if (!chat) return;

    chatBox.replaceChildren();

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

    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "user"
            ? "message-wrapper user-wrapper"
            : "message-wrapper";

    const avatar = document.createElement("img");

    avatar.className = "avatar";

    avatar.src =
        sender === "user"
            ? "/images/user.png"
            : "/images/bot.jpeg";

    const bubble = document.createElement("div");

    bubble.className =
        sender === "user"
            ? "user-bubble"
            : "ai-bubble";

    if (sender === "ai") {

        bubble.innerHTML = marked.parse(text);

        // Highlight code blocks if Highlight.js is loaded
        if (typeof hljs !== "undefined") {

            bubble.querySelectorAll("pre code").forEach(block => {

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

    chatBox.scrollTop = chatBox.scrollHeight;

    // Return bubble so it can be updated later
    return bubble;

}
// ==========================================
// Send Message
// ==========================================

button.addEventListener("click", sendMessage);

async function sendMessage() {

    const text = input.value.trim();

    if (text === "") return;

    if (currentChat === null) {

        createNewChat();

    }

    const chat = conversations.find(c => c.id === currentChat);

    addMessage("user", text);

    chat.messages.push({

        sender: "user",

        text: text

    });

    if (chat.title === "New Chat") {

        chat.title = text.substring(0, 25);

        renderHistory();

    }

    saveConversations();

    input.value = "";

    // ==========================================
    // Animated Typing Indicator
    // ==========================================

    const typing = addMessage("ai", "●");

    let dots = 1;

    const typingAnimation = setInterval(() => {

        dots++;

        if (dots > 3) dots = 1;

        typing.textContent = "● ".repeat(dots);

    }, 400);

    try {

      const response = await fetch("/api/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                message: text,

                history: chat.messages.map(m => ({

                    role: m.sender === "user"
                        ? "user"
                        : "assistant",

                    content: m.text

                }))

            })

        });

        const data = await response.json();

        clearInterval(typingAnimation);

        typing.innerHTML = marked.parse(data.reply);

        if (typeof hljs !== "undefined") {

            typing.querySelectorAll("pre code").forEach(block => {

                hljs.highlightElement(block);

            });

        }

        chat.messages.push({

            sender: "ai",

            text: data.reply

        });

        saveConversations();

    } catch (error) {

        clearInterval(typingAnimation);

        console.error(error);

        typing.innerHTML = marked.parse(
            "**Connection error. Please try again.**"
        );

    }

}
// ==========================================
// Press Enter
// ==========================================

input.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});

// ==========================================
// Sidebar Buttons
// ==========================================

newChatBtn.onclick = () => {

    createNewChat();

    addMessage(
        "ai",
        "# 👋 Welcome to Nexora AI\n\nI'm **Nexora AI**, your intelligent AI assistant.\n\nHow can I help you today?"
    );

};

clearBtn.onclick = () => {

    if (confirm("Delete all chats?")) {

        conversations = [];

        currentChat = null;

        localStorage.removeItem("conversations");

        history.innerHTML = "";

        chatBox.replaceChildren();

        createNewChat();

        addMessage(
            "ai",
            "# 👋 Welcome to Nexora AI\n\nI'm **Nexora AI**, your intelligent AI assistant.\n\nHow can I help you today?"
        );

    }

};

// ==========================================
// Start App
// ==========================================

renderHistory();

if (conversations.length > 0) {

    loadConversation(conversations[0].id);

} else {

    createNewChat();

    addMessage(
        "ai",
        "# 👋 Welcome to Nexora AI\n\nI'm **Nexora AI**, your intelligent AI assistant.\n\nHow can I help you today?"
    );

}