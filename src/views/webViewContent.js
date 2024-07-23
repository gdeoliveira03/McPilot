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
          <span id="awsAccessKeyIcon" class="material-icons-outlined">visibility_off</span>
        </button>
      </div>
    </div>
    <div class="input-group">
      <label>AWS Secret Key:</label>
      <div class="input-with-icon">
        <input type="password" id="awsSecretKey">
        <button type="button" class="toggle-visibility" onclick="toggleVisibility('awsSecretKey')">
          <span id="awsSecretKeyIcon" class="material-icons-outlined">visibility_off</span>
        </button>
      </div>
    </div>
    <div class="input-group">
      <label>AWS Region:</label>
      <select id="awsRegion">
        <option value="">Select a region</option>
        <option value="us-east-2">US East (Ohio)</option>
        <option value="us-east-1">US East (Virginia)</option>
        <option value="us-west-1">US West (N. California)</option>
        <option value="us-west-2">US West (Oregon)</option>
        <option value="af-south-1">Africa (Cape Town)</option>
        <option value="ap-east-1">Asia Pacific (Hong Kong)</option>
        <option value="ap-south-2">Asia Pacific (Hyderabad)</option>
        <option value="ap-southeast-3">Asia Pacific (Jakarta)</option>
        <option value="ap-southeast-4">Asia Pacific (Melbourne)</option>
        <option value="ap-south-1">Asia Pacific (Mumbai)</option>
        <option value="ap-northeast-3">Asia Pacific (Osaka)</option>
        <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
        <option value="ca-central-1">Canada (Central)</option>
        <option value="ca-west-1">Canada West (Calgary)</option>
        <option value="eu-central-1">Europe (Frankfurt)</option>
        <option value="eu-west-1">Europe (Ireland)</option>
        <option value="eu-west-2">Europe (London)</option>
        <option value="eu-south-1">Europe (Milan)</option>
        <option value="eu-west-3">Europe (Paris)</option>
        <option value="eu-south-2">Europe (Spain)</option>
        <option value="eu-north-1">Europe (Stockholm)</option>
        <option value="eu-central-2">Europe (Zurich)</option>
        <option value="il-central-1">Israel (Tel Aviv)</option>
        <option value="me-south-1">Middle East (Bahrain)</option>
        <option value="me-central-1">Middle East (UAE)</option>
        <option value="sa-east-1">South America (São Paulo)</option>
      </select>
    </div>
    <div class="centered-button">
      <button onclick="enterCredentials()">Enter</button>
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
  <div id="message" class="hidden centered-container">
    <h3 id="messageText"></h3>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
     let visibilityTimeouts = {};

    function enterCredentials() {
      const awsAccessKey = document.getElementById('awsAccessKey').value;
      const awsSecretKey = document.getElementById('awsSecretKey').value;
      const awsRegion = document.getElementById('awsRegion').value;
      const filename = document.getElementById('filename').value;

      if (!awsAccessKey || !awsSecretKey || !awsRegion || !filename) {
        vscode.postMessage({
          command: 'showError',
          text: 'Please fill in all the fields before continuing.'
        });
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
      document.getElementById('message').classList.add('hidden');
      vscode.postMessage({ command: 'clearProgress' });
    }

    function generateCode() {
      const prompt = document.getElementById('prompt').value;
      const awsAccessKey = document.getElementById('awsAccessKey').value;
      const awsSecretKey = document.getElementById('awsSecretKey').value;
      const awsRegion = document.getElementById('awsRegion').value;
      const filename = document.getElementById('filename').value;

      if (!prompt || !filename) {
        vscode.postMessage({
          command: 'showError',
          text: 'Description and filename are required.'
        });
        return;
      }

      vscode.postMessage({
        command: 'generate',
        text: prompt,
        awsAccessKey: awsAccessKey,
        awsSecretKey: awsSecretKey,
        awsRegion: awsRegion,
        filename: filename
      });

      document.getElementById('message').classList.remove('hidden');
      document.getElementById('messageText').innerText = 'Generating Terraform template...';
      }

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'progress':
          document.getElementById('message').classList.remove('hidden');
          document.getElementById('messageText').innerText = message.text;
          break;
        case 'templateGenerated':
          document.getElementById('message').classList.remove('hidden');
          document.getElementById('messageText').innerText = 'Please review the generated template and make necessary changes before saving.';
          break;
      }
    });

      function toggleVisibility(fieldId) {
      const field = document.getElementById(fieldId);
      const icon = document.getElementById(fieldId + 'Icon');
      if (field.type === 'password') {
        field.type = 'text';
        icon.textContent = 'visibility';
        startVisibilityTimeout(fieldId);
      } else {
        field.type = 'password';
        icon.textContent = 'visibility_off';
        clearTimeout(visibilityTimeouts[fieldId]);
      }
    }

    function startVisibilityTimeout(fieldId) {
      clearTimeout(visibilityTimeouts[fieldId]);
      visibilityTimeouts[fieldId] = setTimeout(() => {
        const field = document.getElementById(fieldId);
        const icon = document.getElementById(fieldId + 'Icon');
        field.type = 'password';
        icon.textContent = 'visibility_off';
      }, 10000); // 10 seconds in milliseconds
    }

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'progress':
          document.getElementById('message').classList.remove('hidden');
          document.getElementById('messageText').innerText = message.text;
          break;
        case 'templateGenerated':
          document.getElementById('message').classList.remove('hidden');
          document.getElementById('messageText').innerText = 'Please review the generated template and make necessary changes before saving.';
          break;
        case 'showError':
          vscode.postMessage({ command: 'showError', text: message.text });
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
