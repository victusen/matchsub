import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";
import { fetchTodayFixtures } from "./footballServices.js";
import { filterMenFixtures } from "../controller/filterMenFixture.js";
import getLineupTime from "../utils/get-lineup-time.js";
import getCron from "../utils/get-cron-syntax.js"; 
import getLineup from "../utils/get-lineup-string.js";
import getKickoffString from "../utils/get-kickoff-string.js";

dotenv.config();

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

        todayFixtures.forEach(f => {
          scheduledFixture.push({
            fixtureId: f.fixture.id,
            homeTeam: f.teams.home.name,
            awayTeam: f.teams.away.name,
            kickOffTime: f.fixture.date,
            lineUpTime: getLineupTime(f.fixture.date),
          });
        });

        console.log("Scheduled fixtures:", scheduledFixture);

        scheduledFixture.forEach(f => {
            // cron for posting kick off
            const job = cron.schedule(getCron(f.kickOffTime), () => {
                try {
                    const post = getKickoffString(f);
                    jobsQueue.push(post);
                } catch (err) {
                    console.log("job to post kickoff: " + f.homeTeam + " vs " + f.awayTeam + " failed");
                    return;
                } finally {
                    job.stop();
                    job.destroy();
                    console.log("job for kickoff: " + f.homeTeam + " vs " + f.awayTeam + " destroyed");
                }        
            });

            // cron for posting lineup
            const ljob = cron.schedule(getCron(f.lineUpTime), async () => {
                try {
                    const post = await postLineup(f);
                    if (post) {
                        jobsQueue.push(post);
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
        console.log("gotten response");
        
        const lineups = response.data.response;
        if (!lineups || lineups.length < 2) {
            console.log("Lineup not ready yet for " + fixture.homeTeam + " vs " + fixture.awayTeam);
            return null;
        }
        
        console.log("gotten lineup for " + fixture.homeTeam + " vs " + fixture.awayTeam);
        return getLineup(lineups);

    } catch (err) {
        console.log("Failed to fetch Lineup: " + err.message);
        return null;
    }
}