const path = require('path');
const vscode = require('vscode');

function getWebviewContent(panel) {
  const cssPath = vscode.Uri.file(path.join(__dirname, 'styles.css'));
  const cssUri = panel.webview.asWebviewUri(cssPath);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>McPilot</title>
  <link rel="stylesheet" type="text/css" href="${cssUri}">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</head>
<body>
  <h1>McPilot</h1>
  <div id="awsCredentialsTitle" class="centered">
    <h3>To get started, enter the filename and your AWS account information:</h3>
  </div>
  <div id="awsCredentials" class="centered-container">
    <div class="input-group">
      <label>Filename: <small>(name for the generated file)</small></label>
      <input type="text" id="filename" placeholder="Enter desired filename, e.g., template.tf"><br>
    </div>
    <div class="input-group">
      <label>AWS Access Key:</label>
      <div class="input-with-icon">
        <input type="password" id="awsAccessKey">
        <button type="button" class="toggle-visibility" onclick="toggleVisibility('awsAccessKey')">
          <span id="awsAccessKeyIcon" class="material-icons-outlined">visibility</span>
        </button>
      </div>
    </div>
    <div class="input-group">
      <label>AWS Secret Key:</label>
      <div class="input-with-icon">
        <input type="password" id="awsSecretKey">
        <button type="button" class="toggle-visibility" onclick="toggleVisibility('awsSecretKey')">
          <span id="awsSecretKeyIcon" class="material-icons-outlined">visibility</span>
        </button>
      </div>
    </div>
    <div class="input-group">
      <label>AWS Region:</label>
      <input type="text" id="awsRegion">
    </div>
    <div class="centered-button">
      <button onclick="enterCredentials()">Continue</button>
    </div>
  </div>
  <div id="terraformPrompt" class="hidden centered-container">
    <h3 class="centered">What can I do for you today?</h3>
    <textarea id="prompt" rows="10" placeholder="Describe the terraform template you want to generate"></textarea>
    <div class="button-container">
      <button onclick="goBack()">Back</button>
      <button onclick="generateCode()">Generate</button>
    </div>
  </div>
  <div id="progress"></div>
  <script>
    const vscode = acquireVsCodeApi();
    let visibilityTimeouts = {};

    function enterCredentials() {
      const awsAccessKey = document.getElementById('awsAccessKey').value;
      const awsSecretKey = document.getElementById('awsSecretKey').value;
      const awsRegion = document.getElementById('awsRegion').value;
      const filename = document.getElementById('filename').value;

      if (!awsAccessKey || !awsSecretKey || !awsRegion || !filename) {
        alert('Please fill in all AWS credentials');
        return;
      }

      document.getElementById('awsCredentials').classList.add('hidden');
      document.getElementById('terraformPrompt').classList.remove('hidden');
      document.getElementById('awsCredentialsTitle').classList.add('hidden');
    }

    function goBack() {
      document.getElementById('terraformPrompt').classList.add('hidden');
      document.getElementById('awsCredentials').classList.remove('hidden');
      document.getElementById('awsCredentialsTitle').classList.remove('hidden');
    }

    function generateCode() {
      const prompt = document.getElementById('prompt').value;
      const awsAccessKey = document.getElementById('awsAccessKey').value;
      const awsSecretKey = document.getElementById('awsSecretKey').value;
      const awsRegion = document.getElementById('awsRegion').value;
      const filename = document.getElementById('filename').value;

      vscode.postMessage({
        command: 'generate',
        text: prompt,
        awsAccessKey: awsAccessKey,
        awsSecretKey: awsSecretKey,
        awsRegion: awsRegion,
        filename: filename
      });
    }

    function toggleVisibility(fieldId) {
      const field = document.getElementById(fieldId);
      const icon = document.getElementById(fieldId + 'Icon');
      if (field.type === 'password') {
        field.type = 'text';
        icon.textContent = 'visibility_off';
        startVisibilityTimeout(fieldId);
      } else {
        field.type = 'password';
        icon.textContent = 'visibility';
        clearTimeout(visibilityTimeouts[fieldId]);
      }
    }

    function startVisibilityTimeout(fieldId) {
      clearTimeout(visibilityTimeouts[fieldId]);
      visibilityTimeouts[fieldId] = setTimeout(() => {
        const field = document.getElementById(fieldId);
        const icon = document.getElementById(fieldId + 'Icon');
        field.type = 'password';
        icon.textContent = 'visibility';
      }, 10000); // 10 seconds in milliseconds
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

module.exports = {
  getWebviewContent,
};
