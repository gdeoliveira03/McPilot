require('dotenv').config({
  path: `${__dirname}/.env`
});

const vscode = require("vscode");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
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

function preprocessPrompt(rawPrompt) {
  // Template for generating Terraform code with instructions for the AI
  const template = `
    You are an expert in generating Terraform templates. The user will provide a description of what the Terraform template should do. Please generate a \`.tf\` file based on the user's description with the following requirements:

    1. The output must be valid Terraform code.
    2. Only include code in the output. Any explanations or non-code content should be commented out with a \`#\`.
    3. Ensure that all necessary resources, configurations, and permissions are included.
    4. Use AWS as the cloud provider.
    5. Provide comments and explanations within the code using the \`#\` symbol.

    Here is the user's description:
    "${rawPrompt}"

    Generate the Terraform template below:
  `;

  return template.trim();
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

            const refinedPrompt = preprocessPrompt(prompt);

            panel.webview.postMessage({ command: "progress", text: "Generating Terraform configuration..." });

            try {
              const fullPrompt = `${refinedPrompt}
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