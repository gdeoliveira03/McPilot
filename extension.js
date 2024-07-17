require('dotenv').config({
  path: `${__dirname}/.env`
})

const vscode = require("vscode");

const OPENAI_API_KEY = "a2915647c0c04a159c72f15c4f275fe5";
const OPENAI_ENDPOINT = "https://McPilot.openai.azure.com";
const DEPLOYMENT_ID = "pilot";
const API_VERSION = "2023-09-15-preview";

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTerraformCode(prompt, retries = 5, backoff = 1000) {
  const fetch = (await import('node-fetch')).default;

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
        const retryAfter = response.headers.get('retry-after');
        const delayTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
        await delay(delayTime);
        backoff *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].text.trim();
    } catch (error) {
      if (i === retries - 1) {
        console.error("Error fetching Terraform code:", error);
        throw new Error(`Error fetching Terraform code: ${error.message}`);
      }
    }
  }
}

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "mcpilot.mcpilotLives",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "terraformCodeGenerator",
        "McPilot",
        vscode.ViewColumn.Two,  
        {
          enableScripts: true
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

            panel.webview.postMessage({ command: "progress", text: "Generating Terraform template..." });

            try {
              const terraformCode = await getTerraformCode(prompt);
              const document = await vscode.workspace.openTextDocument({
                content: terraformCode,
                language: "terraform",
              });
              await vscode.window.showTextDocument(document, vscode.ViewColumn.One);  
              panel.webview.postMessage({ command: "progress", text: "" });

            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to generate Terraform template: ${error.message}`
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
      <title>McPilot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 10px;
          margin: 20px;
        }
        textarea {
          width: 100%;
          margin-bottom: 10px;
        }
        button {
          background-color: purple;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background-color: darkmagenta;
        }
        #progress {
          margin-top: 10px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <h1>McPilot</h1>
      <h3>What can I do for you today?</h3>
      <textarea id="prompt" rows="10" placeholder="Describe the terraform template you want to generate"></textarea>
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
