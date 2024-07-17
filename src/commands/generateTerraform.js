const vscode = require("vscode");
const { preprocessPrompt } = require("../utils/prompt.js");
const { getTerraformCode } = require("../utils/api.js");
const { getWebviewContent } = require("../views/webviewContent.js");

async function generateTerraform(context) {
  const panel = vscode.window.createWebviewPanel(
    "terraformCodeGenerator",
    "McPilot",
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
        const filename = message.filename;

        if (!prompt || !filename) {
          vscode.window.showErrorMessage("Description and filename are required.");
          return;
        }

        const refinedPrompt = preprocessPrompt(prompt);

        panel.webview.postMessage({ command: "progress", text: "Generating Terraform configuration" });

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
          
          const workspaceFolders = vscode.workspace.workspaceFolders;
          if (!workspaceFolders) {
            vscode.window.showErrorMessage("No workspace folder open.");
            return;
          }

          const workspaceFolder = workspaceFolders[0].uri.fsPath;
          const filePath = `${workspaceFolder}/${filename}`;

          const fileUri = vscode.Uri.file(filePath);
          await vscode.workspace.fs.writeFile(fileUri, Buffer.from(finalTerraformCode, 'utf8'));

          const document = await vscode.workspace.openTextDocument(fileUri);
          await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
          panel.webview.postMessage({ command: "progress", text: "" });
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