const vscode = require("vscode");
const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");

const { preprocessPrompt } = require("../utils/prompt.js");
const { getTerraformCode } = require("../utils/api.js");
const { getWebviewContent } = require("../views/webviewContent.js");

const predefinedTemplates = {
  "Provision an EC2 instance": "Provision an EC2 instance",
  "Transfer files to an S3 bucket": "Transfer files to an S3 bucket",
};

async function generateTerraform(context) {
  const panel = vscode.window.createWebviewPanel(
    "terraformCodeGenerator",
    "McPilot",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent(panel);

  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "generate":
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
            const fullPrompt = `${refinedPrompt}\n\n
                                AWS Access Key: ${awsAccessKey}\n\n
                                AWS Secret Key: ${awsSecretKey}\n\n
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

            const templatesDir = path.join(__dirname, "..", "..", "templates");
            if (!fs.existsSync(templatesDir)) {
              fs.mkdirSync(templatesDir, { recursive: true });
            }

            const filePath = path.join(templatesDir, filename);

            fs.writeFileSync(filePath, finalTerraformCode);

            panel.webview.postMessage({
              command: "templateGenerated",
            });

          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to generate Terraform configuration: ${error.message}`
            );
          }
          break;

        case "upload":
          const awsAccessKeyUpload = message.awsAccessKey;
          const awsSecretKeyUpload = message.awsSecretKey;
          const awsRegionUpload = message.awsRegion;
          const filenameUpload = message.filename;
          const filePathUpload = path.join(__dirname, "..", "..", "templates", filenameUpload);

          try {
            await uploadToS3(filePathUpload, filenameUpload, awsAccessKeyUpload, awsSecretKeyUpload, awsRegionUpload);
          } catch (error) {
            vscode.window.showErrorMessage(`Error uploading file to S3: ${error.message}`);
          }
          break;

        case "showError":
          vscode.window.showErrorMessage(message.text);
          break;

        default:
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

function uploadToS3(filePath, filename, awsAccessKey, awsSecretKey, awsRegion) {
  return new Promise((resolve, reject) => {
    AWS.config.update({
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
      region: awsRegion,
    });

    const s3 = new AWS.S3();
    const params = {
      Bucket: "mcpilots3bucket",
      Key: filename,
      Body: fs.readFileSync(filePath),
    };

    s3.upload(params, function (err, data) {
      if (err) {
        reject(new Error(`Failed to upload file to S3: ${err.message}`));
      } else {
        vscode.window.showInformationMessage(`File uploaded successfully to ${data.Location}`);
        resolve();
      }
    });
  });
}

module.exports = {
  generateTerraform,
};