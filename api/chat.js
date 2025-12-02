import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const aiResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI learning coach for Year 7–8 Digital Technologies.
Help students with ACARA v9 skills:
- AC9TDI8K01–K04 (systems & data)
- AC9TDI8P04–P10 (design, algorithms, UX, code)
Give scaffolds for struggling students and extensions for advanced students.
Do NOT write the full assessment for them.
`
        },
        { role: "user", content: message }
      ],
      temperature: 0.6,
      max_tokens: 400
    });

    res.status(200).json({
      reply: aiResponse.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong. Try again." });
  }
}
