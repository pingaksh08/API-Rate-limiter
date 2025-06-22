const axios = require("axios");

const [,, targetUrl, rateLimit, duration] = process.argv;

if (!targetUrl || !rateLimit || !duration) {
    console.error("Usage: node rateLimiter.js <url> <requests_per_second> <duration_in_seconds>");
    process.exit(1);
}

const rps = parseInt(rateLimit, 10);
const runDuration = parseInt(duration, 10) * 1000;
const interval = 1000 / rps;

let totalRequests = 0;
let success = 0;
let failure = 0;

console.log(`Starting rate limiter for ${targetUrl}`);
console.log(`Rate: ${rps} requests/sec for ${duration} seconds...\n`);

const startTime = Date.now();

const sendRequest = async () => {
    try {
        const res = await axios.get(targetUrl);
        console.log(`✅ [${res.status}] ${targetUrl}`);
        success++;
    } catch (err) {
        if (err.response) {
            console.log(`❌ [${err.response.status}] ${targetUrl}`);
        } else {
            console.log(`❌ [ERROR] ${err.message}`);
        }
        failure++;
    } finally {
        totalRequests++;
    }
};

const timer = setInterval(() => {
    const now = Date.now();
    if (now - startTime >= runDuration) {
        clearInterval(timer);
        console.log(`\nFinished.`);
        console.log(`Total: ${totalRequests}, Success: ${success}, Failed: ${failure}`);
        return;
    }

    sendRequest();
}, interval);
