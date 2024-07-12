// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mcpilot" is now active!');

	context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('mcpilotChat', new ChatViewProvider(context))
    );

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('mcpilot.chatbot', () => {
        vscode.commands.executeCommand('workbench.view.extension.mcpilotSidebar');
    });

	context.subscriptions.push(disposable);
}

class ChatViewProvider {
    constructor(context) {
        this.context = context;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getWebviewContent();

        webviewView.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'sendMessage':
                        await this.handleSendMessage(webviewView, message.text);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    getWebviewContent() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Chatbot</title>
            </head>
            <body>
                <h1>Chat with AI</h1>
                <div id="chatbox"></div>
                <input id="userInput" type="text" placeholder="Type a message...">
                <button onclick="sendMessage()">Send</button>
                <script>
                    const vscode = acquireVsCodeApi();
                    function sendMessage() {
                        const message = document.getElementById('userInput').value;
                        vscode.postMessage({ command: 'sendMessage', text: message });
                    }
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'receiveMessage':
                                const chatbox = document.getElementById('chatbox');
                                const p = document.createElement('p');
                                p.textContent = message.text;
                                chatbox.appendChild(p);
                                break;
                        }
                    });
                </script>
            </body>
            </html>`;
    }

    async handleSendMessage(webviewView, messageText) {
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch('YOUR_API_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText })
            });
            const data = await response.json();
            webviewView.webview.postMessage({ command: 'receiveMessage', text: data.reply });
        } catch (error) {
            console.error('Error sending message:', error);
            webviewView.webview.postMessage({ command: 'receiveMessage', text: 'Error communicating with the server.' });
        }
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
