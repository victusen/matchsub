import cron from "node-cron";
import axios from "axios";
import { fetchTodayFixtures } from "./footballServices.js";
import { filterMenFixtures } from "../controller/filterMenFixture.js";
import { supabase, insertToSupabase } from "./supabase.js";
import getLineupTime from "../utils/get-lineup-time.js";
import getCron from "../utils/get-cron-syntax.js"; 
import getLineup from "../utils/get-lineup-string.js";
import getKickoffString from "../utils/get-kickoff-string.js";

export const scheduledFixture = [];
export const liveFixtures = [];

// Local reference to the jobs array passed from the entrypoint
let jobsQueue = [];

export async function scheduleFixturesForToday(jobs) {
  if (jobs) {
    jobsQueue = jobs;
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .eq("date", today)
    console.log("today is ", today);
    // console.log(data[0]?.date);
    // console.log("Supabase data object, ", data)

    scheduledFixture.length = 0;

    if (error) {
      console.log("Error Fetching from supabase")
      console.log(error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("Supabase empty, defaulting to api-sports");

      const fixtures = await fetchTodayFixtures();
      const todayFixtures = filterMenFixtures(fixtures);
          
      console.log(`Today's fixtures: ${fixtures.length}, Matched: ${todayFixtures.length}`); 

      if (todayFixtures.length === 0) { 
        console.log("No fixture today. Ending operation")
        return;
      };

      // Clear existing schedules for the new run
      for (const f of todayFixtures) {
        scheduledFixture.push({
          fixtureId: f.fixture.id,
          homeTeam: f.teams.home.name,
          awayTeam: f.teams.away.name,
          kickOffTime: f.fixture.date,
          lineUpTime: getLineupTime(f.fixture.date),
          status: Date.now() >= (new Date(f.fixture.date).getTime() + (2 * 60 * 60 * 1000)) ? "finished" : Date.now() >= new Date(f.fixture.date).getTime() ? "live" : "scheduled",
          date: today
        });

        await insertToSupabase({
          fixture_id: f.fixture.id,
          home_team: f.teams.home.name,
          away_team: f.teams.away.name,
          kickoff_time: f.fixture.date,
          lineup_time: getLineupTime(f.fixture.date),
          status: Date.now() >= (new Date(f.fixture.date).getTime() + (2 * 60 * 60 * 1000)) ? "finished" : Date.now() >= new Date(f.fixture.date).getTime() ? "live" : "scheduled",
          date: today
        });
      };
      console.log("ALL MATCHED FIXTURES SAVED TO SUPABASE");
    } else {
        scheduledFixture.push(
          ...data.map(row => ({
            fixtureId: row.fixture_id,
            homeTeam: row.home_team,
            awayTeam: row.away_team,
            kickOffTime: row.kickoff_time,
            lineUpTime: row.lineup_time,
            status: Date.now() >= (new Date(row.kickoff_time).getTime() + (2 * 60 * 60 * 1000)) ? "finished" : Date.now() >= new Date(row.kickoff_time).getTime() ? "live" : "scheduled",
            date: row.date
          }))
        );

        console.log(`[RECOVERY] Scheduled ${scheduledFixture.length} fixtures from Supabase`);
    }

    if (data?.length > 0) {
      console.log(`[RECOVERY] Found ${data.length} fixtures already saved in Supabase`);
     
      // For code to check new live games and update Supabase 
    }

    liveFixtures.length = 0;

    liveFixtures.push(...scheduledFixture.filter(match => match.status === "live"));

    console.log("Scheduled fixtures:", scheduledFixture.length);

    console.log("[LIVE FIXTURES]: ", liveFixtures.map(f => f.homeTeam + " - " + f.awayTeam));

    // Start creating Queues
    scheduledFixture
    .filter(f => f.status !== "finished")
    .forEach(f => {

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
          if (!liveFixtures.find(x => x.fixtureId === f.fixtureId)) { liveFixtures.push(f) };
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

  } catch (error) {
    console.log("[ERROR]: scheduleFixturesForToday failed");
    console.log(error);
  }
  console.log("[SUCCESS] - All cron jobs are scheduled", "Pray server don't crash 🔥");
}


// INDEPENDENT CRON-JOB TO FIXTURES
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

cron.schedule("0 */10 * * * *", async () => {
  for (const fixture of liveFixtures) {
    if (Date.now() >= (new Date(fixture.kickOffTime).getTime() + (2 * 60 * 60 * 1000))) {
      console.log("This fixture Is above Live actions", "Pulling away from Live");
      const index = liveFixtures.indexOf(fixture);
      if (index !== -1) { liveFixtures.splice(index, 1) }
      continue;
    };
    try {
      const URL = `https://v3.football.api-sports.io/fixtures/events?fixture=${fixture.fixtureId}`;
      const PARAMS = {
        headers: {
          "x-apisports-key": process.env.API_SPORT_KEY,
        }
      };
      const res = await axios.get(URL, PARAMS); 
      console.log(res.data.response);
      // const response = res.data.response.filter(match => match.events.length > 0);
    } catch (err) {
      console.log(err);
    }
  }
})