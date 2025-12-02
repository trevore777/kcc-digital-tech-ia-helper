const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Please send a valid message." });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return res.status(500).json({ reply: "Server not configured correctly." });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
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
`
        },
        { role: "user", content: message }
      ],
      temperature: 0.6,
      max_tokens: 450
    });

    const reply =
      (response.choices &&
        response.choices[0] &&
        response.choices[0].message &&
        response.choices[0].message.content) ||
      "I couldn’t generate a reply. Try asking again in a different way.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res
      .status(500)
      .json({ reply: "The IA Helper had an error. Please try again or tell your teacher." });
  }
};
