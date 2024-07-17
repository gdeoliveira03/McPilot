require('dotenv').config({
  path: `${__dirname}/.env`
});

const vscode = require("vscode");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
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
      <label>AWS Access Key: <input type="password" id="awsAccessKey"></label><br>
      <label>AWS Secret Key: <input type="password" id="awsSecretKey"></label><br>
      <label>AWS Region: <input type="text" id="awsRegion"></label><br>
      <button onclick="generateCode()">Generate</button>
      <div id="progress"></div>
      <script>
        const vscode = acquireVsCodeApi();
        function generateCode() {
          const prompt = document.getElementById('prompt').value;
          const awsAccessKey = document.getElementById('awsAccessKey').value;
          const awsSecretKey = document.getElementById('awsSecretKey').value;
          const awsRegion = document.getElementById('awsRegion').value;

          vscode.postMessage({
            command: 'generate',
            text: prompt,
            awsAccessKey: awsAccessKey,
            awsSecretKey: awsSecretKey,
            awsRegion: awsRegion
          });
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

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "mcpilot.mcpilotLives",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "terraformCodeGenerator",
        "Terraform Code Generator",
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
            const awsAccessKey = message.awsAccessKey;
            const awsSecretKey = message.awsSecretKey;
            const awsRegion = message.awsRegion;

            if (!prompt) {
              vscode.window.showErrorMessage("No description provided.");
              return;
            }

            panel.webview.postMessage({ command: "progress", text: "Generating Terraform configuration..." });

            try {
              const fullPrompt = `${prompt}
              AWS Access Key: ${awsAccessKey}
              AWS Secret Key: ${awsSecretKey}
              AWS Region: ${awsRegion}`;

              const terraformCode = await getTerraformCode(fullPrompt);

              const finalTerraformCode = terraformCode
                .replace(/\$\{aws_access_key\}/g, awsAccessKey)
                .replace(/\$\{aws_secret_key\}/g, awsSecretKey)
                .replace(/\$\{aws_region\}/g, awsRegion);

              const document = await vscode.workspace.openTextDocument({
                content: finalTerraformCode,
                language: "terraform",
              });
              await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
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

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};