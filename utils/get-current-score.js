// import { supabase } from "../services/supabase.js";
import getFTString from "./get-full-time-string.js"
import reformPostName from "./reform-post-name.js"

export default function getCurrentScore(events, fixture, minute) {
  let home = 0;
  let away = 0;
  const scorers = [];

  for (const e of events) {
    if (e.type !== "Goal") continue;
    if (minute <= 89) {
      if (e.time.elapsed > minute) continue;
    }
    
    const playerName = e.player?.name || "";
    /* const min = e.time.extra 
      ? `${e.time.elapsed}+${e.time.extra}'` 
      : `${e.time.elapsed}'`; */

    if (e.team.name === fixture.homeTeam) {
      home++;
      scorers.push(`${reformPostName(playerName)}`);
    } else if (e.team.name === fixture.awayTeam) {
      away++;
      scorers.push(`${reformPostName(playerName)}`);
    }
  }

  // Call to add to supabase
  /* const { data, error } = await supabase
    .from("fixtures")
    .select("goalscorers")
    .eq("fixture_id", fixture.fixtureId)
    .single(); 

  if (error) {
    console.error(`Failed to getting the Scorer for ${fixture.fixtureId}:`, error.message);
  }

  if (data) {
    const { error: updateError } = await supabase
    .from("fixtures")
    .update({ goalscorers: (data.goalscorers || "") + scorers.join(", ") })
    .eq("fixture_id", fixture.fixtureId);

    if (updateError) {
      console.error(`Failed to update golascorer for ${fixture.fixtureId}:`, updateError.message);
    }
  } */

  // if (minute > 89) { getFTString()}
  return {
    homeScore: home,
    awayScore: away,
    goalscorers: scorers.join(", "),
    ftPost: `🚩 FT: ${fixture.homeTeam} ${home}-${away} ${fixture.awayTeam} 

⚽ Goalscorers: ${scorers.join(", ")}

👉 Follow Player of the Match`
  };
}
