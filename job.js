console.log("JOB.JS LOADED");
import http from "http";
import cron from "node-cron";
import { postToFacebook } from "./controller/facebookController.js";
import { scheduleFixturesForToday } from "./services/scheduleFixtures.js";

// Location to queue all jobs/posts to be posted to facebook
export const jobs = [];

// Initialize today's schedules on boot
await scheduleFixturesForToday(jobs);

// Schedule daily sync at 08:00 AM
cron.schedule("0 8 * * *", async () => {
    console.log("Daily sync: scheduling fixtures for the new day...");
    await scheduleFixturesForToday(jobs);
}, {timezone: "Africa/Lagos"});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

cron.schedule("* * * * *", async () => {
    if (jobs.length === 0) return;

    const jobsToProcess = jobs.splice(0);

    let i = 1;
    for (const job of jobsToProcess) {
        console.log("[QUEUED]: " + job );

        console.time("POSTED: " + i + " " + job);
        await postToFacebook(job); 
        console.log("[POSTED]: ");
        console.timeEnd("POSTED: " + i + " " + job);

        const delay = generateNumber(15000, 90000);
        console.log("[RESTED]: " + delay/1000 + "s");
        await sleep(delay);

        i++;
    };
});

// Health-check server for Render (free web service tier requires HTTP)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        status: "running",
        scheduledFixtures: jobs.length,
        uptime: process.uptime().toFixed(0) + "s"
    }));
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));

function generateNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function pingAlways() {
    const randomDelay = generateNumber(360000, 780000);

    try {
        console.log("13mins: Pinging server up...");
        const res = await fetch('https://matchsub.onrender.com');
        console.log("Server is up again\n", res.status, "\n");
    } catch (err) {
        console.log("[DOWN]: Server is down\n", err.message, "\n");
    }

    console.log("THE NEXT_PING IN " + randomDelay/1000 + "s");
    

    setTimeout(() => pingAlways(), randomDelay);
}

pingAlways();