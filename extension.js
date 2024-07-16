require("dotenv").config({
  path: `${__dirname}/.env`,
});

const vscode = require("vscode");
const axios = require("axios");
const aws = require("aws-sdk");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
const DEPLOYMENT_ID = "pilot";
const API_VERSION = "2023-09-15-preview";

// This is the endpoint url to the DevBot Lamda Function
const LAMDA_FUNCTION_ENDPOINT =
  "https://ka09n6y39a.execute-api.us-east-1.amazonaws.com/dev/generate-terraform";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTerraformCode(prompt, retries = 5, backoff = 1000) {
  const fetch = (await import("node-fetch")).default;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        `${OPENAI_ENDPOINT}/openai/deployments/${DEPLOYMENT_ID}/completions?api-version=${API_VERSION}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": OPENAI_API_KEY,
          },
          body: JSON.stringify({
            prompt: prompt,
            temperature: 0.7,
            top_p: 1,
            stop: null,
            max_tokens: 10000,
          }),
        }
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const delayTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
        await delay(delayTime);
        backoff *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const terraformCode = data.choices[0].text.trim();
      await sendToLamda(terraformCode);
      return terraformCode;
    } catch (error) {
      if (i === retries - 1) {
        console.error("Error fetching Terraform code:", error);
        throw new Error(`Error fetching Terraform code: ${error.message}`);
      }
    }
  }
}

// Lamda functions only take key-value values in a json format
// TO-DO: NEED TO FIGURE OUT HOW TO PARSE THE FILE SO THAT THE LAMDA FUNCTION CAN TAKE IT AS INPUT
async function sendToLambda(terraformCode) {
  try {
    const lambdaResponse = await axios.post(
      LAMBDA_FUNCTION_URL,
      { terraformCode },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Lambda response:", lambdaResponse.data);
    vscode.window.showInformationMessage(
      "Terraform code sent to Lambda successfully!"
    );
  } catch (error) {
    console.error(
      "Error sending to Lambda:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      `Error sending to Lambda: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "mcpilot.mcpilotLives",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "terraformCodeGenerator",
        "Terraform Code Generator",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === "generate") {
            const prompt = message.text;
            if (!prompt) {
              vscode.window.showErrorMessage("No description provided.");
              return;
            }

            panel.webview.postMessage({
              command: "progress",
              text: "Generating Terraform configuration...",
            });

            try {
              const terraformCode = await getTerraformCode(prompt);
              const document = await vscode.workspace.openTextDocument({
                content: terraformCode,
                language: "terraform",
              });
              await vscode.window.showTextDocument(
                document,
                vscode.ViewColumn.One
              );
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to generate Terraform configuration: ${error.message}`
              );
            }
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terraform Code Generator</title>
    </head>
    <body>
      <h1>Terraform Code Generator</h1>
      <textarea id="prompt" rows="10" cols="50" placeholder="Enter the description for the Terraform configuration"></textarea>
      <br>
      <button onclick="generateCode()">Generate</button>
      <div id="progress"></div>
      <script>
        const vscode = acquireVsCodeApi();
        function generateCode() {
          const prompt = document.getElementById('prompt').value;
          vscode.postMessage({ command: 'generate', text: prompt });
        }

        window.addEventListener('message', event => {
          const message = event.data;
          switch (message.command) {
            case 'progress':
              document.getElementById('progress').innerText = message.text;
              break;
          }
        });
      </script>
    </body>
    </html>
  `;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
