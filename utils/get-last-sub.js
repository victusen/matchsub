import { supabase } from "../services/supabase.js"

export default async function getLastSubProcessed(fixtureId) {
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