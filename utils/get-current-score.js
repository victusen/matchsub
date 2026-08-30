export default async function getCurrentScore(events, fixture, minute) {
  let home = 0;
  let away = 0;
  const scorers = [];

  for (const e of events) {
    if (e.type !== "Goal") continue;
    if (e.time.elapsed > minute) continue;

    const playerName = e.player?.name || "Unknown";
    const min = e.time.extra 
      ? `\( {e.time.elapsed}+ \){e.time.extra}'` 
      : `${e.time.elapsed}'`;

    if (e.team.name === fixture.homeTeam) {
      home++;
      scorers.push(`\( {playerName} ( \){min})`);
    } else if (e.team.name === fixture.awayTeam) {
      away++;
      scorers.push(`\( {playerName} ( \){min})`);
    }
  }

  // Call to add to supabase
  const { data, error } = await supabase
    .from("fixtures")
    .select("goalscorers")
    .eq("fixture_id", fixtureId)
    .single();

  if (error) {
    console.error(`Failed to getting the Scorer for ${fixtureId}:`, error.message);
    ;
  }

  if (data?.goalscorers) {
    const { error } = await supabase
    .from("fixtures")
    .update(goalscorers: (data.goalscorerrs + scorer.join(", ") })
    .eq("fixture_id", fixtureId);

    if (error) {
      console.error(`Failed to update golascorer for ${fixtureId}:`, error.message);
    }
  }

  return {
    homeScore,
    awayScore,
    goalscorers: scorers.join(", ")   // e.g. "Rashford (23'), Mbeumo (67')"
  };
}
