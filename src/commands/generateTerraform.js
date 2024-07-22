const vscode = require("vscode");
const fs = require("fs");

const AWS = require("aws-sdk");
const path = require("path");

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
        const filename = message.filename;

        if (!prompt || !filename) {
          vscode.window.showErrorMessage(
            "Description and filename are required."
          );
          return;
        }

        const refinedPrompt = preprocessPrompt(prompt);

        panel.webview.postMessage({
          command: "progress",
          text: "Generating Terraform configuration...",
        });

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

          console.log("testing");
          const document = await vscode.workspace.openTextDocument({
            content: finalTerraformCode,
            language: "terraform",
          });
          await vscode.window.showTextDocument(document, vscode.ViewColumn.One);

          const templatesDir = path.join(__dirname, "..", "..", "templates");
          if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
          }

          const filePath = path.join(templatesDir, filename);
          console.log(filePath);

          fs.writeFileSync(filePath, finalTerraformCode);

          AWS.config.update({
            accessKeyId: awsAccessKey,
            secretAccessKey: awsSecretKey,
            region: awsRegion,
          });

          const s3 = new AWS.S3();

          const params = {
            Bucket: "mcpilotbucket",
            Key: filename,
            Body: fs.readFileSync(filePath),
          };

          console.log(awsSecretKey);

          s3.upload(params, function (err, data) {
            if (err) {
              vscode.window.showErrorMessage(
                `Failed to upload file to S3: ${err.message}`
              );
            } else {
              vscode.window.showInformationMessage(
                `File uploaded successfully to ${data.Location}`
              );
            }
          });
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
