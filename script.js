/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// System prompt for the chatbot
const systemPrompt =
  "You are a helpful assistant for L'Oréal. Only answer questions related to L'Oréal products, beauty routines, and recommendations. If asked about anything else, politely say you can only help with L'Oréal topics.";

// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Store the conversation as an array of messages
let messages = [{ role: "system", content: systemPrompt }];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user's message to chat window
  chatWindow.innerHTML += `<div class="msg user">${userMessage}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Add user's message to messages array
  messages.push({ role: "user", content: userMessage });

  // Clear the input box
  userInput.value = "";

  // Show a loading message
  chatWindow.innerHTML += `<div class="msg ai" id="loadingMsg">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send request to Cloudflare Worker endpoint instead of OpenAI API
    const response = await fetch(
      "https://loreal-worker.robertalamo.workers.dev",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
        }),
      }
    );

    const data = await response.json();

    // Get the chatbot's reply
    const aiReply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "Sorry, I couldn't get a response. Please try again.";

    // Remove loading message and show AI reply
    document.getElementById("loadingMsg").remove();
    chatWindow.innerHTML += `<div class="msg ai">${aiReply}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Add AI reply to messages array
    messages.push({ role: "assistant", content: aiReply });
  } catch (error) {
    // Remove loading message and show error
    document.getElementById("loadingMsg").remove();
    chatWindow.innerHTML += `<div class="msg ai">Sorry, there was a problem connecting to the assistant.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
