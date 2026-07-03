const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { marked } = require("marked");
const hljs = require("highlight.js");

marked.setOptions({
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true
});

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ==========================
// OpenAI Client
// ==========================

let client = null;

if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.trim() !== ""
) {
    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// ==========================
// Chat Endpoint
// ==========================

app.post("/chat", async (req, res) => {

    const { message, history = [] } = req.body;

    // ==================================
    // Demo Mode
    // ==================================

    if (!client) {

        const text = message.toLowerCase();

        let reply;

        if (text.includes("hello") || text.includes("hi")) {

            reply = `# Hello 👋

Welcome to **Nexora AI**.

I'm currently running in demo mode.

Once connected to OpenAI I'll be able to:

- Answer questions
- Write code
- Explain concepts
- Analyze files
- Generate images
- Remember conversations`;

        } else {

            reply = `# Demo Mode

Your OpenAI API is not connected or has no available credits.

After connecting your API key, Nexora AI will respond with full AI-powered answers including Markdown, code blocks, tables and more.`;

        }

        return res.json({
            reply
        });

    }

    // ==================================
    // OpenAI Mode
    // ==================================

    try {

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

- Use # and ## headings.
- Use bullet points whenever appropriate.
- Use numbered lists for steps.
- Use tables for comparisons.
- Wrap all code inside triple backticks with the language.
- Use **bold** for important words.
- Use *italic* where appropriate.
- Break long answers into sections.
- Never return one huge paragraph.
- Make your responses look similar to ChatGPT.
`
                },

                ...history,

                {
                    role: "user",
                    content: message
                }

            ]

        });

        res.json({

            reply: completion.choices[0].message.content

        });

    } catch (error) {

        console.error("========== OPENAI ERROR ==========");
        console.error(error);

        if (error.status) console.error("Status:", error.status);
        if (error.code) console.error("Code:", error.code);
        if (error.message) console.error("Message:", error.message);

        res.status(500).json({

            reply: `# Connection Error

Sorry, I couldn't connect to OpenAI.

Please check:

- API Key
- Billing
- Internet connection
- OpenAI platform status`

        });

    }

});

// ==========================
// Start Server
// ==========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`🚀 Nexora AI is running on http://localhost:${PORT}`);

});