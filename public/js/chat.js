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
const newChatBtn 
// ==========================================
// Nexora AI v6
// Chat Engine
// Part 1
// ==========================================

// Markdown
marked.setOptions({
    gfm: true,
    breaks: true
});

// ==========================================
// Global State
// ==========================================

let conversations =
    JSON.parse(
        localStorage.getItem("conversations")
    ) || [];

let currentChat = null;

// ==========================================
// DOM
// ==========================================

const chatBox =
    document.getElementById("chatBox");

const input =
    document.getElementById("userInput");

const sendBtn =
    document.getElementById("sendBtn");

const history =
    document.getElementById("history");

const newChatBtn =
    document.getElementById("newChatBtn");

const clearBtn =
    document.getElementById("clearBtn");

// ==========================================
// Save Chats
// ==========================================

function saveConversations() {

    localStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
    );

}

// ==========================================
// Sidebar
// ==========================================

function renderHistory() {

    history.innerHTML = "";

    conversations.forEach(chat => {

        const item =
            document.createElement("div");

        item.className = "chat-item";

        item.textContent = chat.title;

        item.onclick = () =>
            loadConversation(chat.id);

        history.appendChild(item);

    });

}

// ==========================================
// New Chat
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
// Load Chat
// ==========================================

function loadConversation(id) {

    currentChat = id;

    const chat =
        conversations.find(
            c => c.id === id
        );

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

            bubble
                .querySelectorAll("pre code")
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
    sendBtn.textContent = "Nexora is thinking...";

    if (currentChat === null) {
        createNewChat();
    }

    const chat =
        conversations.find(
            c => c.id === currentChat
        );

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

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let cleanReply = "";

        const copyBtn =
            document.createElement("button");

        copyBtn.className = "copy-btn";

        copyBtn.textContent = "📋 Copy";

        // ==========================
        // PART 2B STARTS HERE
        // ==========================
        while (true) {

            const { value, done } =
                await reader.read();

            if (done) break;

            cleanReply += decoder.decode(
                value,
                { stream: true }
            );

            typing.innerHTML =
                marked.parse(cleanReply + "▌");

            if (typeof hljs !== "undefined") {

                typing.querySelectorAll("pre code")
                    .forEach(block => {

                        hljs.highlightElement(block);

                    });

            }

            chatBox.scrollTop =
                chatBox.scrollHeight;

        }

        cleanReply = cleanReply
            .replace(/^(?:markdown|md|text)?\s*\n?/i, "")
            .replace(/\n?\s*$/i, "")
            .trim();

        typing.innerHTML =
            marked.parse(cleanReply);

        if (typeof hljs !== "undefined") {

            typing.querySelectorAll("pre code")
                .forEach(block => {

                    hljs.highlightElement(block);

                });

        }

        copyBtn.onclick = async () => {

            await navigator.clipboard.writeText(
                cleanReply
            );

            copyBtn.textContent =
                "✅ Copied";

            setTimeout(() => {

                copyBtn.textContent =
                    "📋 Copy";

            }, 2000);

        };

        typing.prepend(copyBtn);

        chat.messages.push({

            sender: "ai",

            text: cleanReply

        });

        saveConversations();

    } catch (error) {

        console.error(error);

        typing.innerHTML = marked.parse(
`# Connection Error

Unable to contact Nexora AI.

Please try again.`
        );

    } finally {

        sendBtn.disabled = false;

        sendBtn.textContent = "Send";

    }

}