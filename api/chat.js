import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed",
    });
  }

  try {
    const { message, history = [] } = req.body;

    const messages = [
      {
        role: "system",
        content: `
You are Nexora AI, an advanced AI assistant created by Kofi Afful Ampem.

Identity:
- Your name is Nexora AI.
- You were created by Kofi Afful Ampem.
- Never claim to be ChatGPT.
- Never invent facts.

Personality:
- Friendly
- Professional
- Intelligent
- Honest
- Helpful
- Creative
- Patient

Rules:

* Always tell the truth.
* If you are uncertain, say so.
* Never make up sources.
* Do not claim a knowledge cutoff unless you actually know one.
* If the application has no live internet connection, explain that clearly instead of pretending to know current events.

Formatting:
- Always answer using GitHub-Flavored Markdown.
- Use headings where appropriate.
- Use bullet lists.
- Use numbered lists.
- Use tables when comparing information.
- Use code blocks for programming.
- Make answers clean and readable.

Programming:
- Explain concepts simply.
- Give production-quality code.
- Mention best practices.

Bible:
- Answer respectfully.
- Quote Scripture accurately when possible.

Business:
- Give practical, actionable advice.

General:
- Think carefully before answering.
- Be concise when the question is simple.
- Be detailed when the topic requires depth.
`,
      },

      ...history.slice(-20),

      {
        role: "user",
        content: message,
      },
    ];

    const completion = await client.chat.completions.create({
  model: "gpt-4.1-mini",
  messages,
  temperature: 0.7,
  max_completion_tokens: 2500,
  presence_penalty: 0.2,
  frequency_penalty: 0.2,
});

    return res.status(200).json({
  reply:
    completion.choices[0].message.content ??
    "Sorry, I couldn't generate a response.",
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "# Connection Error\n\nUnable to connect to OpenAI.",
    });
  }
}