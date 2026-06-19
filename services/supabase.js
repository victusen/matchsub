import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const Url = process.env.SUPABASE_URL;
const Key = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(Url, Key);

export async function insertToSupabase({fixture_id, home_team, away_team, kickoff_time, lineup_time }) {
    try {
        const { data, error } = await supabase
            .from("fixtures")
            .insert([
                {
                    "fixture_id": fixture_id,
                    "home_team": home_team,
                    "away_team": away_team,
                    "kickoff_time": kickoff_time,
                    "lineup_time": lineup_time                  
                }
            ]);

        console.log("Fixture saved:", home_team, "vs", away_team, "id: " + fixture_id);

        if (err) {
            console.log("Supabase Error:", err);
            return;
        }
    } catch (error) {
        console.log("Unexpected Error:", error);
    }
}; 