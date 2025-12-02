const chatWindow = document.getElementById("chat-window");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const stageSelect = document.getElementById("stage-select");
const questionSelect = document.getElementById("question-select");
const useQuestionBtn = document.getElementById("use-question");

let isWaiting = false;

// Stage-based suggestion library
const stageSuggestions = {
  stage1: [
    "I’m on Stage 1 and I don’t really understand what a digital system is. Can you explain it simply?",
    "Can you help me think of examples of hardware, software and networks for my workbook?",
    "How do digital systems and networks connect to AC9TDI8K01 and AC9TDI8K02?"
  ],
  stage2: [
    "I’m on Stage 2 and binary is confusing. Can you explain why computers use binary and how it links to AC9TDI8K04?",
    "How do I explain my pixel art activity in my own words for the workbook?",
    "Can you help me describe what my data chart shows in Stage 2?"
  ],
  stage3: [
    "I’m on Stage 3 and I don’t know how to explain what an API is. Can you give me a simple definition?",
    "Can you help me turn the API response I see into a game idea?",
    "I tested an API but I don’t understand the JSON. Which parts should I focus on?"
  ],
  stage4: [
    "I’m on Stage 4 and I’m stuck writing user stories. Can you help me with the ‘As a player I want…’ structure?",
    "How can I improve my screen design so it’s easier for players to use?",
    "Can you help me write 3 user stories that match AC9TDI8P04?"
  ],
  stage5: [
    "I’m on Stage 5 and I don’t know how to turn my game into an algorithm. Can you help me list the steps?",
    "How do I turn my steps into a flowchart for AC9TDI8P05?",
    "Can you help me trace my algorithm to check if it will work properly?"
  ],
  stage6: [
    "I’m on Stage 6 and my Swift code has errors. Can you help me debug it if I describe what’s happening?",
    "How do I connect my API call to my game screen in Swift Playgrounds?",
    "Can you give me tips for organising my Swift code so it’s easier to understand?"
  ],
  stage7: [
    "I’m on Stage 7 and need help filling in my bug log. What kind of information should I write?",
    "How can I decide what to improve in my game to make it more user-friendly?",
    "Can you help me evaluate my app against my user stories for AC9TDI8P10?"
  ],
  stage8: [
    "I’m on Stage 8 and need help planning my 1-minute video. What should I say?",
    "How can I reflect on which King’s values I showed in this project?",
    "Can you help me write a reflection that links to AC9TDI8P10 and AC9TDI8P14?"
  ]
};

function populateQuestionSuggestions(stageKey) {
  // Clear current options
  questionSelect.innerHTML = "";

  if (!stageKey || !stageSuggestions[stageKey]) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Pick a stage first…";
    questionSelect.appendChild(opt);
    return;
  }

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "Choose a suggested question…";
  questionSelect.appendChild(defaultOpt);

  stageSuggestions[stageKey].forEach((q, index) => {
    const opt = document.createElement("option");
    opt.value = q;
    opt.textContent = `Suggestion ${index + 1}`;
    questionSelect.appendChild(opt);
  });
}

// When stage changes, update suggestion list
stageSelect.addEventListener("change", () => {
  populateQuestionSuggestions(stageSelect.value);
});

// When "Use suggestion" is clicked, fill the input box
useQuestionBtn.addEventListener("click", () => {
  const selectedValue = questionSelect.value;
  if (!selectedValue) return;
  input.value = selectedValue;
  input.focus();
});

// Chat UI helpers

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = role === "assistant" ? "IA Helper" : "You";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.id = "typing-indicator";
  typing.className = "typing";
  typing.innerHTML = `
    IA Helper is thinking
    <span class="typing-dots">
      <span></span><span></span><span></span>
    </span>`;
  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

// Initial greeting
addMessage(
  "assistant",
  "Hi! I’m your Digital Tech IA Helper for King’s. Use the stage menu above if you like, or just tell me what you’re working on – digital systems, data/binary, APIs, user stories, algorithms, Swift code, or your video reflection."
);

// Form submit (send question to backend)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isWaiting) return;

  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  isWaiting = true;
  sendButton.disabled = true;
  showTypingIndicator();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      throw new Error("Network error: " + res.status);
    }

    const data = await res.json();
    removeTypingIndicator();
    addMessage("assistant", data.reply || "I’m not sure what happened – try asking again in a different way.");
  } catch (err) {
    console.error(err);
    removeTypingIndicator();
    addMessage(
      "assistant",
      "Sorry, something went wrong talking to the AI. Check your connection or let your teacher know, then try again."
    );
  } finally {
    isWaiting = false;
    sendButton.disabled = false;
    input.focus();
  }
});

// Initialise suggestion dropdown in default state
populateQuestionSuggestions("");
