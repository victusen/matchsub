import cron from "node-cron";
import axios from "axios";
import { fetchTodayFixtures } from "./footballServices.js";
import { filterMenFixtures, filterWatchedTeam } from "../controller/filterMenFixture.js";
import { supabase, insertToSupabase } from "./supabase.js";
import getLineupTime from "../utils/get-lineup-time.js";
import prefName from "../utils/get-post-name.js"
import getCron from "../utils/get-cron-syntax.js"; 
import getLineup from "../utils/get-lineup-string.js";
import getKickoffString from "../utils/get-kickoff-string.js";

export const scheduledFixture = [];
export const liveFixtures = [];
let activeJobs = [];

// Local reference to the jobs array passed from the entrypoint
let jobsQueue = [];

export async function scheduleFixturesForToday(jobs) {
  activeJobs.forEach(j => { j.stop(); j.destroy(); });

  activeJobs.length = 0;
  
  if (jobs) {
    jobsQueue = jobs;
  }

  const dt = Date.now();

  try {
    const today = new Date().toISOString().split("T")[0];
    const { error: deleteError } = await supabase
      .from("fixtures")
      .delete()
      .lt("date", today);
    
    if (deleteError) {
      console.log(deleteError.message);
    }

    console.log("Cleaning supabase on new fetch from any fixtures set. Done."); 
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .eq("date", today)
    console.log("Today is ", today);
  
    scheduledFixture.length = 0;

    if (error) {
      console.log("Error on supabase.")
      console.log(error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("Supabase is empty, fetching api-sports");

      const fixtures = await fetchTodayFixtures();
      const todayFixtures = filterMenFixtures(fixtures);
          
      console.log(`Today's fixtures: ${fixtures.length}, Matched: ${todayFixtures.length}`); 

      if (todayFixtures.length === 0) { 
        console.log("No games today.")
        return;
      };

      // Clear existing schedules for new run
      for (const f of todayFixtures) {
        scheduledFixture.push({
          fixtureId: f.fixture.id,
          homeTeam: f.teams.home.name,
          awayTeam: f.teams.away.name,
          kickOffTime: f.fixture.date,
          lineUpTime: getLineupTime(f.fixture.date),
          status: dt >= (new Date(f.fixture.date).getTime() + (2 * 60 * 60 * 1000)) ? "finished" : dt >= new Date(f.fixture.date).getTime() ? "live" : "scheduled",
          date: today
        });
        await insertToSupabase({
          fixture_id: f.fixture.id,
          home_team: f.teams.home.name,
          away_team: f.teams.away.name,
          kickoff_time: f.fixture.date,
          lineup_time: getLineupTime(f.fixture.date),
          status: dt >= (new Date(f.fixture.date).getTime() + (2 * 60 * 60 * 1000)) ? "finished" : dt >= new Date(f.fixture.date).getTime() ? "live" : "scheduled",
          date: today,
          last_sub_processed: { home: 0, away: 0 }
        });
      };
      
      console.log("All matches today are saved in Supabase.");
    } else {
      const activeFixtures = data.filter(row => {
        const endTime = new Date(row.kickoff_time).getTime() + 2 * 60 * 60 * 1000;
    
        return Date.now() < endTime;
    });
      if (activeFixtures.length === 0) {
        console.log("Retrieved today fixtures. All now ended.");
        return;
      }
      scheduledFixture.push(
        ...activeFixtures.map(row => ({
          fixtureId: row.fixture_id,
          homeTeam: row.home_team,
          awayTeam: row.away_team,
          kickOffTime: row.kickoff_time,
          lineUpTime: row.lineup_time,
          status: dt >= (new Date(row.kickoff_time).getTime() + (2 * 60 * 60 * 1000)) ? "finished" : dt >= new Date(row.kickoff_time).getTime() ? "live" : "scheduled",
          date: row.date
          }))
        );

      console.log(`[RECOVERY] Scheduled ${scheduledFixture.length} fixtures from Supabase`);
    };

    liveFixtures.length = 0;

    if (scheduledFixture.length === 0) {
      console.log("No fixture today. Check tomorrow")
      return;
    }
  
    liveFixtures.push(...scheduledFixture.filter(match => match.status === "live"));

    console.log("Scheduled fixtures:", scheduledFixture.length);

    console.log("Live fixtures:", liveFixtures.map(f => f.homeTeam + " - " + f.awayTeam));

    // Creating Queues
    scheduledFixture
    .filter(f => f.status !== "finished")
    .forEach(f => {

      // Create kick off cron job
      const job = cron.schedule(getCron(f.kickOffTime), () => {
        try {
          const post = getKickoffString(f);
          jobsQueue.push(post);
          
          console.log(f.homeTeam, "vs", f.awayTeam, "kickoff post sent to queue. Qty:", jobsQueue.length, "IN QUEUE");
        } catch (err) {
          console.log("Kickoff: " + f.homeTeam + " vs " + f.awayTeam + " Failed.");
          return;
        } finally {
          job.stop();
          job.destroy();
          if (!liveFixtures.find(x => x.fixtureId === f.fixtureId)) { liveFixtures.push(f) };
          // console.log("Cron for kickoff: " + f.homeTeam + " vs " + f.awayTeam + " Destroyed.");
        }
      });

      // Create lineup cron job 
      const ljob = cron.schedule(getCron(f.lineUpTime), async () => {
        try {
          
          const post = await postLineup(f);
          
          if (post) {
            jobsQueue.push(post);
            console.log(f.homeTeam, " - ", f.awayTeam, ": Live. Qty:", jobsQueue.length, "IN QUEUE");
          }
        } catch (err) {
          console.log("Lineup: " + f.homeTeam + " - " + f.awayTeam + " Failed.");
          return;
        } finally {
          ljob.stop();
          ljob.destroy();
          console.log("Lineup: " + f.homeTeam + " - " + f.awayTeam + " Destroyed.");
        }
      });
      activeJobs.push(job, ljob);
    });
    
    console.log("Lineup/Kickoff schedules are set for today. Hope the server don't crash 🙌");
    
  } catch (error) {
    console.log("scheduleFixturesForToday failed");
    console.log(error);
  }
}

// Function to fetch fixture lineups
async function postLineup(fixture) {
  try {
    const URL = `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixture.fixtureId}`;
    const PARAMS = {
      headers: {
        "x-apisports-key": process.env.API_SPORT_KEY,
      }
    };
    const response = await axios.get(URL, PARAMS);
    
    const lineups = response.data.response;
    if (!lineups || lineups.length < 2) {
      console.log(fixture.homeTeam + " - " + fixture.awayTeam, "line ups are not ready.");
      return null;
    }
    
    console.log("Lineup for " + fixture.homeTeam + " - " + fixture.awayTeam + " confirmed ✅!");
    return getLineup(lineups);

  } catch (err) {
    console.log("Failed to fetch Lineup: " + err.message);
    return null;
  }
};

// Cron liveFixture events 
cron.schedule("*/10 * * * *", async () => {
  if (liveFixtures.length === 0) { return };

  for (const fixture of liveFixtures) {
    try {
      // check to know if finished
      if (Date.now() >= (new Date(fixture.kickOffTime).getTime() + (2 * 60 * 60 * 1000))) {
        console.log(fixture.homeTeam + " - " + fixture.awayTeam + " should be ended. Pulling");
        const index = liveFixtures.findIndex(f => f.fixtureId === fixture.fixtureId);
  
        if (index !== -1) {liveFixtures.splice(index,1)};
        
        console.log("Removed from live fixtures.");
        continue;
      }

      console.log(fixture.homeTeam + " - " + fixture.awayTeam + ", still live.")      
  
      let events = [];
  
      const watched = filterWatchedTeam(fixture);
      if (!watched) { continue };
      
      try {
        const URL = `https://v3.football.api-sports.io/fixtures/events?fixture=${fixture.fixtureId}`;
        const PARAMS = {
          headers: {
            "x-apisports-key": process.env.API_SPORT_KEY,
          }
        };
        const res = await axios.get(URL, PARAMS); 
        events = res.data.response;
        console.log(`${fixture.homeTeam} - ${fixture.awayTeam}: ${events.length} events`);
        
        if (!events.length) { continue };
      } catch (err) {
        console.log(err);
        continue;
      }
        
      const homeSubEvent = (watched === "home" || watched === "both") ? events.filter(event => 
    event.type === "subst" && event.team.name === fixture.homeTeam) : [];
      const awaySubEvent = (watched === "away" || watched === "both") ? events.filter(event => 
    event.type === "subst" && event.team.name === fixture.awayTeam) : [];
  
      const { home, away } = await getLastSubProcessed(fixture.fixtureId); 
  
      const newHomeSubEvent = homeSubEvent.slice(home);
      const newAwaySubEvent = awaySubEvent.slice(away); 
  
      const hPost = getSubPostString(newHomeSubEvent, events, fixture, fixture.homeTeam)
      const aPost = getSubPostString(newAwaySubEvent, events, fixture, fixture.awayTeam)
  
      for (const post of hPost) {
        jobsQueue.push(post)
      }
      for (const post of aPost) {
        jobsQueue.push(post)
      }
  
      if (newHomeSubEvent.length || newAwaySubEvent.length) {
        await updateLastSubProcessed(fixture.fixtureId, {
          home: home+newHomeSubEvent.length, 
          away: away+newAwaySubEvent.length
        })
      }
    } catch (err) {
     console.log(`Failed processing fixture ${fixture.fixtureId}:`, err.message);
     continue;
    }
  };
});

// Helper utilies built-in
async function getLastSubProcessed(fixtureId) {
  const { data, error } = await supabase
    .from("fixtures")
    .select("last_sub_processed")
    .eq("fixture_id", fixtureId)
    .single();

  if (error) {
    console.error(`Failed to fetch last_subs_processed for ${fixtureId}:`, error.message);
    return { home: 0, away: 0 };
  }

  if (data?.last_sub_processed) {
    return data.last_sub_processed;
  }

  // Nothing there yet, initialize it
  const initial = { home: 0, away: 0 };
  await updateLastSubProcessed(fixtureId, initial);
  return initial;
};

async function updateLastSubProcessed(fixtureId, updated) {
  const { error } = await supabase
    .from("fixtures")
    .update({ last_sub_processed: updated })
    .eq("fixture_id", fixtureId);

  if (error) {
    console.error(`Failed to update last_subs_processed for ${fixtureId}:`, error.message);
  }
};

/* 
function getCurrentScore(events, fixture) {
  let home = 0;
  let away = 0;

  for (const e of events) {
    if (e.type !== "Goal") continue;

    if (e.team.name === fixture.homeTeam)
      home++;
    else if (e.team.name === fixture.awayTeam)
      away++;
  }

  return { home, away };
} 
*/
function getCurrentScoreUntil(events, fixture, minute) {

  let home = 0;
  let away = 0;

  for (const e of events) {
    if (e.type !== "Goal") continue;
    
    if (e.time.elapsed > minute) continue;

    if (e.team.name === fixture.homeTeam)
      home++;
    else if (e.team.name === fixture.awayTeam)
      away++;
  }

  return { home, away };
}

function getSubString(ev) {
  let subStr = "";
  if (Array.isArray(ev)) {
    ev.forEach(e => {
      subStr += `⬆️ Sub Out: ${e.player?.name ?? ""} (${e.time.elapsed}') \n⬇️ Sub In: ${e.assist?.name ?? ""}\n\n`
    })
  }
  return subStr;
}; 
function getSubPostString(teamEvents, events, fixture, teamName) {
  if (!teamEvents.length) {
    console.log(`${teamName} in \( ${fixture.homeTeam} - ${fixture.awayTeam} \), no new event. Skipping.`);
    return [];
  }

  const posts = [];

  // To sort the events in order of time occurred
  teamEvents.sort((a,b)=> {
    return a.time.elapsed-b.time.elapsed
  });

  let i = 0;

  while (i < teamEvents.length) {

      const startMinute = teamEvents[i].time.elapsed;

      const score = getCurrentScoreUntil(events, fixture, startMinute);

      const group = [];

      while (
          i < teamEvents.length &&
          teamEvents[i].time.elapsed <= startMinute + 1
      ) {
          group.push(teamEvents[i]);
          i++;
      }

      const subs = getSubString(group);

      const homeName =
    teamName === fixture.homeTeam
        ? `[ ${prefName(fixture.homeTeam)} ]`
        : prefName(fixture.homeTeam);

      const awayName =
    teamName === fixture.awayTeam
        ? `[ ${prefName(fixture.awayTeam)} ]`
        : prefName(fixture.awayTeam);

      posts.push(
`🚩 Live: ${homeName} ${score.home}-${score.away} ${awayName}

${subs}

📱 Follow on Player of the Match`
      );
  }

  return posts;
};