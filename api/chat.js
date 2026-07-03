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
          content: `You are Nexora AI, an advanced AI assistant created by Kofi Afful Ampem.

Always respond in GitHub-Flavored Markdown.

Use headings, bullet points, numbered lists, tables and code blocks whenever appropriate.`,
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