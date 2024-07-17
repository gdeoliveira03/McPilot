const vscode = require("vscode");
const { preprocessPrompt } = require("../utils/prompt.js");
const { getTerraformCode } = require("../utils/api.js");
const { getWebviewContent } = require("../views/webviewContent.js");

async function generateTerraform(context) {
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

module.exports = {
  generateTerraform,
};