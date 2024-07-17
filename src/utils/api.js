require('dotenv').config({
    path: `${__dirname}/../../.env`
});
  
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT;
const DEPLOYMENT_ID = "pilot";
const API_VERSION = "2023-09-15-preview";

console.log("API_KEY: ", OPENAI_API_KEY);
console.log("ENDPOINT: ", OPENAI_ENDPOINT);

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
async function getTerraformCode(prompt, retries = 5, backoff = 1000) {
    const fetch = (await import('node-fetch')).default;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(
                `${OPENAI_ENDPOINT}/openai/deployments/${DEPLOYMENT_ID}/completions?api-version=${API_VERSION}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": OPENAI_API_KEY,
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        temperature: 0.7,
                        top_p: 1,
                        stop: null,
                        max_tokens: 10000,
                    }),
                }
            );
  
            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after');
                const delayTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
                await delay(delayTime);
                backoff *= 2;
                continue;
            }
  
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
  
            const data = await response.json();
            return data.choices[0].text.trim();
        } catch (error) {
            if (i === retries - 1) {
            console.error("Error fetching Terraform code:", error);
            throw new Error(`Error fetching Terraform code: ${error.message}`);
            }
        }
    }
}
  
module.exports = {
    getTerraformCode,
};