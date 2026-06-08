import http from "http";
import cron from "node-cron";
import { postToFacebook } from "./controller/facebookController.js";
import { scheduleFixturesForToday } from "./services/scheduleFixtures.js";

// Location to queue all jobs/posts to be posted to facebook

export let jobs = [];

// Initialize today's schedules on boot
scheduleFixturesForToday(jobs);

// Schedule daily sync at 00:05 AM
cron.schedule("0 8 * * *", async () => {
    console.log("Daily sync: scheduling fixtures for the new day...");
    await scheduleFixturesForToday(jobs);
}, {timezone: "Africa/Lagos"});

cron.schedule("* * * * *", async () => {
    if (jobs.length === 0) return;

    console.time("jobq");
    const jobsToProcess = jobs.splice(0);

    let i = 1;
    for (const job of jobsToProcess) {
        console.time("job" + i);
        console.log(job);
        console.timeEnd("job" + i);

        console.time("post");
        await postToFacebook(job);  
        console.timeEnd("post");
        i++;
    };
    console.timeEnd("jobq");
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
