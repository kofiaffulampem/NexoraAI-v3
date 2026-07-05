const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { marked } = require("marked");
const hljs = require("highlight.js");

// Load environment variables
dotenv.config();

// Configure Markdown
marked.setOptions({
    breaks: true,
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, {
                language: lang
            }).value;
        }

        return hljs.highlightAuto(code).value;
    }
});

// Create Express app
const app = express();

// Middleware
app.use(cors());

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"));

// ==========================================
// OpenAI Client
// ==========================================

let client = null;

try {

    if (
        process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY.trim() !== ""
    ) {

        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        console.log("✅ OpenAI client initialized.");

    } else {

        console.log("⚠️ Running in Demo Mode (no API key).");

    }

} catch (err) {

    console.error("Failed to initialize OpenAI:", err.message);

}

// ==========================================
// Chat Endpoint
// ==========================================

app.post("/chat", async (req, res) => {

    console.log("\n========== CHAT REQUEST ==========");
    console.log(req.body);

    const {

        message,
        history = []

    } = req.body;

    if (!message || message.trim() === "") {

        return res.status(400).json({

            reply: "# Error\n\nNo message received."

        });

    }

    // ======================================
    // Demo Mode
    // ======================================

    if (!client) {

        const text = message.toLowerCase();

        let reply = "";

        if (
            text.includes("hello") ||
            text.includes("hi")
        ) {

            reply = `# 👋 Hello!

Welcome to *Nexora AI*.

I'm currently running in *Demo Mode*.

When an OpenAI API key is connected I can:

- Answer questions
- Write code
- Explain concepts
- Analyse files
- Generate Markdown
- Remember conversations`;

        } else {

            reply = `# Demo Mode

Your OpenAI API key is missing or unavailable.

Once connected, Nexora AI will use OpenAI to generate intelligent responses.`;

        }

        return res.json({

            reply

        });

    }
// ======================================
    // OpenAI Mode
    // ======================================

    try {

        console.log("🚀 Reached OpenAI request");

 const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    max_completion_tokens: 2500,
    temperature: 0.7,
    messages: [
        {
            role: "system",
            content: `
You are Nexora AI, an advanced AI assistant created by Kofi Afful Ampem.

Always respond using GitHub-Flavored Markdown.

Rules:

- Use headings (# and ##).
- Use bullet points whenever appropriate.
- Use numbered lists for steps.
- Use tables whenever comparisons are helpful.
- Wrap all code inside triple backticks with the language.
- Use *bold* for important information.
- Break long responses into sections.
- Never return one huge paragraph.
`
        },
        ...history,
        {
            role: "user",
            content: message
        }
    ]
});

console.log("FULL RESPONSE:");
console.log(completion.choices[0].message.content);

const reply =
    completion?.choices?.[0]?.message?.content ||
    "# No response returned.";

return res.json({
    reply
});

    } catch (error) {

        console.error("\n========== OPENAI ERROR ==========");

        console.error(error);

        console.error("Status :", error.status);
        console.error("Code   :", error.code);
        console.error("Type   :", error.type);
        console.error("Message:", error.message);

        if (error.error) {

            console.error("API Error:");

            console.error(error.error);

        }

        return res.status(500).json({

            reply: `# ❌ Connection Error

Nexora AI couldn't reach OpenAI.

*Reason*

${error.message || "Unknown error"}

Please check:

- API key
- Billing / credits
- Internet connection
- OpenAI project settings`

        });

    }

});
// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("");
console.log("========================================");
console.log("Nexora AI Server Started");
console.log(`Local URL : http://localhost:${PORT}`);

if (client) {

    console.log("OpenAI Status : Connected");

} else {

    console.log("OpenAI Status : Demo Mode");

}

console.log("========================================");
console.log("");
});