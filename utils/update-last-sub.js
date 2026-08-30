import { supabase } from "../services/supabase.js"

export default async function updateLastSubProcessed(fixtureId, updated) {
  const { error } = await supabase
    .from("fixtures")
    .update({ last_sub_processed: updated })
    .eq("fixture_id", fixtureId);

  if (error) {
    console.error(`Failed to update last_subs_processed for ${fixtureId}:`, error.message);
  }
};

