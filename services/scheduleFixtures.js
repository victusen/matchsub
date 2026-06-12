import cron from "node-cron";
import axios from "axios";
import { fetchTodayFixtures } from "./footballServices.js";
import { filterMenFixtures } from "../controller/filterMenFixture.js";
import insertToSupabase from "./supabase.js";
import getLineupTime from "../utils/get-lineup-time.js";
import getCron from "../utils/get-cron-syntax.js"; 
import getLineup from "../utils/get-lineup-string.js";
import getKickoffString from "../utils/get-kickoff-string.js";

export const scheduledFixture = []; 

// Local reference to the jobs array passed from the entrypoint
let jobsQueue = [];

export async function scheduleFixturesForToday(jobs) {
    if (jobs) {
        jobsQueue = jobs;
    }
    try {
        const fixtures = await fetchTodayFixtures();
        const todayFixtures = filterMenFixtures(fixtures);
        
        console.log(`Today's fixtures: ${fixtures.length}, Matched: ${todayFixtures.length}`);

        // Clear existing schedules for the new run
        scheduledFixture.length = 0;

        for (const f of todayFixtures) {
          scheduledFixture.push({
            fixtureId: f.fixture.id,
            homeTeam: f.teams.home.name,
            awayTeam: f.teams.away.name,
            kickOffTime: f.fixture.date,
            lineUpTime: getLineupTime(f.fixture.date),
          });

          await insertToSupabase({
            fixture_id: f.fixture.id,
            home_team: f.teams.home.name,
            away_team: f.teams.away.name,
            kickoff_time: f.fixture.date,
            lineup_time: getLineupTime(f.fixture.date),
          });
        };

        console.log("Scheduled fixtures:", scheduledFixture);

        // Start creating Queues
        scheduledFixture.forEach(f => {
            // Create kick off cron job
            const job = cron.schedule(getCron(f.kickOffTime), () => {
                try {
                    const post = getKickoffString(f);
                    jobsQueue.push(post);
                    console.log("[Kickoff Queue]: ", f.homeTeam, "vs", f.awayTeam, "Queue size:", jobsQueue.length);
                } catch (err) {
                    console.log("job to post kickoff: " + f.homeTeam + " vs " + f.awayTeam + " failed");
                    return;
                } finally {
                    job.stop();
                    job.destroy();
                    console.log("job for kickoff: " + f.homeTeam + " vs " + f.awayTeam + " destroyed");
                }        
            });

            // Create lineup cron job 
            const ljob = cron.schedule(getCron(f.lineUpTime), async () => {
                try {
                    const post = await postLineup(f);
                    if (post) {
                        jobsQueue.push(post);
                        console.log("[Lineup Queued]: ", f.homeTeam, "vs", f.awayTeam, "Queue size:", jobsQueue.length);
                    }
                } catch (err) {
                    console.log("job to post lineup: " + f.homeTeam + " vs " + f.awayTeam + " failed");
                    return;
                } finally {
                    ljob.stop();
                    ljob.destroy();
                    console.log("job for lineup: " + f.homeTeam + " vs " + f.awayTeam + " destroyed");
                }        
            });
        });
    } catch (err) {
        console.error("Error scheduling today's fixtures:", err);
    }
}

async function postLineup(fixture) {
    try {
        const URL = `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixture.fixtureId}`;
        const PARAMS = {
            headers: {
                "x-apisports-key": process.env.API_SPORT_KEY,
            }
        };
        const response = await axios.get(URL, PARAMS);
        console.log("Gotten Line-up for: " + fixture.homeTeam + " vs " + fixture.awayTeam);
        
        const lineups = response.data.response;
        if (!lineups || lineups.length < 2) {
            console.log("Lineup not ready yet for " + fixture.homeTeam + " vs " + fixture.awayTeam + " atleast not both teams.");
            // Return 
            return null;
        }
        
        console.log("Line-ups for " + fixture.homeTeam + " vs " + fixture.awayTeam + " gotten");
        return getLineup(lineups);

    } catch (err) {
        console.log("Failed to fetch Lineup: " + err.message);
        return null;
    }
}