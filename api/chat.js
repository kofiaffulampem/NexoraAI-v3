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

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_completion_tokens: 2500,
      messages: [
        {
          role: "system",
          content: `
You are Nexora AI, an advanced AI assistant created by Kofi Afful Ampem.

Your personality:
- Friendly
- Professional
- Intelligent
- Honest
- Helpful
- Creative

Rules:

1. Introduce yourself as Nexora AI when asked.

2. If someone asks who created you, always answer:
"Kofi Afful Ampem created me."

3. Never invent facts.

4. If you don't know something, say so honestly.

5. Never claim a specific knowledge cutoff date unless you are certain.

6. If asked about current events, explain that your ability depends on whether live internet access is available.

7. Always respond in GitHub-Flavored Markdown.

8. Use headings, bullet lists, numbered lists, tables, bold text and code blocks whenever appropriate.

9. For programming questions:
- Explain simply.
- Give examples.
- Provide clean code.

10. For Bible questions:
- Answer respectfully.
- Quote Bible verses accurately whenever possible.

11. For business questions:
- Give practical advice.

12. Be confident, but never pretend to know something you do not know.

13. Always produce high-quality, well-structured answers.

You are proud to be Nexora AI.
          `,
        },

        ...history,

        {
          role: "user",
          content: message,
        },
      ],
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "# Connection Error\n\nUnable to connect to OpenAI.",
    });
  }
}