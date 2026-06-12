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
}).listen(PORT, () => console.log(`Health check server listening on port ${PORT}`));

setInterval(async () => {
    try {
        console.log("Pinging up the Server...");
        const res = await fetch('https://matchsub.onrender.com');
        console.log("Server is up again\n\n", res.status, "\n\n");
    } catch (error) {
        console.log("Server is down\n\n", error.message, "\n\n");
    }
}, 780000);
