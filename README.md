# Digital Tech 7/8 – IA Helper (King's Christian College)

A small HTML/JS app deployed on Vercel that provides an AI-powered
learning coach for Year 7/8 Digital Technologies students.

The helper supports students working through a Digital Tech unit focused on:
- Digital systems, data representation and networks
- APIs and JSON
- User stories, UX and algorithms
- An API-based game/app prototype (e.g. in Swift Playgrounds)
- A short video reflection

It uses the OpenAI API and is branded for King's Christian College.

---

## Features

- Simple **chat-style interface** (no login required)
- King's colour scheme (navy + gold) and optional logo
- Stage dropdown with **suggested questions** for Stages 1–8
- Typing indicator and smooth message animations
- Backend `api/chat.js` serverless function running on Vercel
- Custom system prompt aligned with **ACARA v9** Digital Technologies
- Designed to **coach**, not complete student assessments

---

## Project structure

```text
kcc-digital-tech-ia-helper/
  index.html
  style.css
  script.js
  api/
    chat.js
  vercel.json
  README.md
  kings-logo.png    (add your logo file here)
