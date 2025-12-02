// Vercel serverless function at /api/chat

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    // Read raw body and parse JSON (works reliably on Vercel)
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    let parsed = {};
    try {
      parsed = JSON.parse(body || "{}");
    } catch (e) {
      console.error("JSON parse error:", e);
      return res.status(400).json({ reply: "Invalid JSON in request body." });
    }

    const { section, message, history } = parsed;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Please send a valid message." });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return res.status(500).json({ reply: "Server not configured correctly." });
    }

    // Build messages array for OpenAI, including short history if provided
    const chatHistory = Array.isArray(history)
      ? history.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      : [];

    const systemPrompt = `
You are an AI learning coach for Year 7–8 Digital Technologies students at King's Christian College in Queensland.

CONTEXT:
- Students are working on an API-based game/app built in Swift Playgrounds or similar.
- They have a digital workbook and an assessment task.
- They are learning about digital systems, data and binary, networks, APIs, user stories, UX, algorithms, coding and debugging, and video reflection.

LINK TO ACARA (Digital Technologies v9):
- AC9TDI8K01–K04: hardware, networks, data representation, binary.
- AC9TDI8P01–P03: data collection, storage, visualisation.
- AC9TDI8P04–P08: user stories, design criteria, algorithms, UX.
- AC9TDI8P09–P10: implementing/debugging code, evaluating solutions.
- AC9TDI8P11–P14: collaboration, tools, privacy, cyber security & digital footprint.

YOUR BEHAVIOUR:
- Coach students to think; do not complete their assessment.
- Give short, clear explanations with examples they can adapt.
- When helpful, offer three levels:
  * CORE (what everyone needs),
  * BOOST (extra scaffolding),
  * LEVEL UP (extension).
- Encourage them using King's values:
  Live Purposefully, Love Faithfully, Learn Passionately, Lead Diligently.
- Occasionally name an ACARA code in simple terms, e.g.
  "This links to AC9TDI8P05 – designing algorithms."

If the user mentions they are on a specific stage (1–8) or section, tailor your guidance to that part of the project.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      {
        role: "user",
        content: section
          ? `(Section: ${section}) ${message}`
          : message
      }
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
        max_tokens: 450
      })
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI API error:", openaiRes.status, errorText);
      return res.status(500).json({
        reply: "The IA Helper had an issue talking to OpenAI. Please try again later."
      });
    }

    const data = await openaiRes.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I couldn’t generate a reply. Try asking again in a different way.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("IA Helper error:", error);
    return res
      .status(500)
      .json({ reply: "The IA Helper had an error. Please try again or tell your teacher." });
  }
}
