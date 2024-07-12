const Groq = require("groq-sdk");
const readline = require("readline");
require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Ensure API key is available
if (!GROQ_API_KEY) {
  console.error("Error: GROQ_API_KEY is not set in the environment variables.");
  process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function getChatCompletion(messages, model) {
  try {
    const response = await groq.chat.completions.create({ messages, model });
    return response.choices[0]?.message?.content || "No response content available.";
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    return "An error occurred while processing your request.";
  }
}

async function main() {
  const model = "llama3-8b-8192";
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [];

  function promptUser() {
    rl.question("You: ", async (userInput) => {
      const exitCommands = ["exit", "end", "bye"];
      if (exitCommands.includes(userInput.toLowerCase())) {
        console.log("Exiting chat...");
        rl.close();
        return;
      }

      messages.push({ role: "user", content: userInput });

      console.log("Sending request to Groq AI...");
      const completion = await getChatCompletion(messages, model);

      messages.push({ role: "assistant", content: completion });

      console.log(`Groq AI: ${completion}`);
      promptUser(); // Continue prompting the user
    });
  }

  promptUser(); // Start the chat
}

main();