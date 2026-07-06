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
// Auto-resize textarea
input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
});
// Auto-resize textarea
input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
});
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

   // Add Copy button for AI messages
if (sender === "ai") {

    const copyBtn = document.createElement("button");

    copyBtn.className = "copy-btn";

    copyBtn.textContent = "📋 Copy";

    copyBtn.onclick = async () => {

        await navigator.clipboard.writeText(text);

        copyBtn.textContent = "✅ Copied";

        setTimeout(() => {

            copyBtn.textContent = "📋 Copy";

        }, 2000);

    };

    bubble.appendChild(document.createElement("br"));
    bubble.appendChild(copyBtn);

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
    button.disabled = true;
button.textContent = "Thinking...";
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
    button.disabled = false;
    button.textContent = "Send";
    input.value = "";
    input.style.height = "auto";
    // ==========================================
    // Animated Typing Indicator
    // ==========================================

    const typing = addMessage(
    "ai",
    `<div class="thinking">
        <span></span>
        <span></span>
        <span></span>
    </div>`
);
    try {

      const response = await fetch("/chat", {

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
        console.log(data.reply);
console.log("FULL RESPONSE:");
console.log(data.reply);

        typing.innerHTML = marked.parse(data.reply);
button.disabled = false;
button.textContent = "Send";
// Create Copy button
const copyBtn = document.createElement("button");
copyBtn.className = "copy-btn";
copyBtn.innerHTML = "📋 Copy";

copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(data.reply);

    copyBtn.innerHTML = "✅ Copied";

    setTimeout(() => {
        copyBtn.innerHTML = "📋 Copy";
    }, 2000);
};

// Put the button at the top of the AI message
typing.prepend(copyBtn);
console.log(marked.parse(data.reply));
console.log(typing.innerHTML);
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