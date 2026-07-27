import http from "http";
import cron from "node-cron";
import { postToFacebook } from "./controller/facebookController.js";
import { scheduleFixturesForToday, scheduledFixture, liveFixtures } from "./services/scheduleFixtures.js";
console.log("JOB.JS LOADED");

// Location to queue all jobs/posts to be posted to facebook
export const jobs = [];

// test: cost testPost = "🚩 Todays games:\n\n🇪🇸 Barcelona - CE Europa 🇪🇸 (20:00)\n🇳🇴 Rosenborg - Man Utd 🏴󠁧󠁢󠁥󠁮󠁧󠁿 (18:00)\n🇸🇦 Al-Hilal - Sundowns 🇿🇦 (18:00)\n\n📲 Follow Player Of The Match";

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
        console.log(`[QUEUED:] JOB${i}`);

        await postToFacebook(job); 
  
        await sleep(15000);

        i++;
    };
});

// Health-check server for Render (free web service tier requires HTTP)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        status: "running",
        todayFixtures: scheduledFixture.length + " games: " + scheduledFixture.map(f => `${f.homeTeam} - ${f.awayTeam}`).join(", "),
        live: liveFixtures.length + " games: " + scheduledFixture.map(f => `${f.homeTeam} - ${f.awayTeam}`).join(", "),
        uptime: process.uptime().toFixed(0) + "s"
    }, null, 2));
}).listen(PORT, () => { console.log(`Server running on port ${PORT}`); })

function generateNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function pingAlways() {
  const randomDelay = generateNumber(360000, 660000);

  try {
    console.log("Pinging server");
    const res = await fetch('https://matchsub.onrender.com');
    if (res.ok) {
      console.log("Server is up.", res.status);
    } else {
      console.log(`Server responded with ${res.status}`);
    }
  } catch (err) {
    console.log("[DOWN]: Server is down\n", err.message, "\n");
  }

  console.log("pinging in: " + randomDelay/(1000 * 60) + "mins");
    
  setTimeout(() => pingAlways(), randomDelay);
}
pingAlways();