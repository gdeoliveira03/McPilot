/* 
Load Environment Variables:
Use the dotenv package to load the environment variables from your .env file. This should be done at the top of your index.js file.

FOR VERSION CONTROL FOR AWS REMOVE THE .ENV FILE!!!!!!
Use AWS console to declare environment variables instead of .env file
*/

// for aws lambda function use the following code to load environment variables
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 5; // Adjust this limit as needed

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2)); // Log incoming event

    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
        return {
            statusCode: 429, // Too Many Requests
            body: JSON.stringify({ error: 'Rate limit exceeded' }),
        };
    }

    requestCount++;

    const prompt = event.prompt;

    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 150,  // Limiting tokens to control costs
            n: 1,  // Limit to one completion
            stop: null,
            temperature: 0.7,
        });

        console.log('OpenAI response:', response); // Log OpenAI response

        const terraformTemplate = response.data.choices[0].text.trim();

        // Reset request count every minute
        setTimeout(() => {
            requestCount = 0;
        }, 60000);

        return {
            statusCode: 200,
            body: JSON.stringify({
                terraformTemplate: terraformTemplate,
            }),
        };
    } catch (error) {
        console.error('Error generating Terraform template:', error); // Log error details
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error generating Terraform template' }),
        };
    }
};