const vscode = require("vscode");
const { generateTerraform } = require("./commands/generateTerraform.js");

function activate(context) {
  let disposable = vscode.commands.registerCommand("mcpilot.mcpilotLives", () =>
    generateTerraform(context)
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
