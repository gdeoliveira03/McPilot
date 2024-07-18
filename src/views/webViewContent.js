function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>McPilot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          margin: 20px;
        }
        .centered-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 300px;
          margin-top: 20px;
        }
        textarea {
          width: 100%;
          margin-bottom: 20px;
          margin-top: 20px;
        }
        .button-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        button {
          background-color: purple;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          border-radius: 10px; 
        }
        button:hover {
          background-color: darkmagenta;
        }
        #progress {
          margin-top: 10px;
          color: #333;
        }
        .hidden {
          display: none;
        }
        .input-group {
          margin-bottom: 10px;
          width: 100%;
        }
        label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .centered-button {
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 15px;
        }
        .centered {
          text-align: center;
          width: 100%;
          margin-top: -10px;
        }
        #progress {
          margin-top: 20px;
          color: grey;
        }
      </style>
    </head>
    <body>
      <h1>McPilot</h1>
      <div id="awsCredentialsTitle" class="centered">
        <h3>Please enter the filename and your AWS account credentials</h3>
      </div>
      <div id="awsCredentials" class="centered-container">
        <div class="input-group">
          <label>Filename: <input type="text" id="filename" placeholder="template.tf"></label><br>
        </div>
        <div class="input-group">
          <label>AWS Access Key: <input type="password" id="awsAccessKey"></label>
        </div>
        <div class="input-group">
          <label>AWS Secret Key: <input type="password" id="awsSecretKey"></label>
        </div>
        <div class="input-group">
          <label>AWS Region: <input type="text" id="awsRegion"></label>
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
