const vscode = require("vscode");

const OPENAI_API_KEY = "a2915647c0c04a159c72f15c4f275fe5";
const OPENAI_ENDPOINT = "https://McPilot.openai.azure.com";
const DEPLOYMENT_ID = "pilot";
const API_VERSION = "2023-09-15-preview";

async function getTerraformCode(prompt) {
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
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].text.trim();
  } catch (error) {
    console.error("Error fetching Terraform code:", error);
    throw new Error(`Error fetching Terraform code: ${error.message}`);
  }
}

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "mcpilot.mcpilotLives",
    async () => {
      const prompt = await vscode.window.showInputBox({
        prompt: "Enter the description for the Terraform configuration",
      });

      if (!prompt) {
        vscode.window.showErrorMessage("No description provided.");
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating Terraform configuration...",
          cancellable: false,
        },
        async (progress) => {
          try {
            const terraformCode = await getTerraformCode(prompt);
            const document = await vscode.workspace.openTextDocument({
              content: terraformCode,
              language: "terraform",
            });
            vscode.window.showTextDocument(document);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to generate Terraform configuration: ${error.message}`
            );
          }
        }
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
