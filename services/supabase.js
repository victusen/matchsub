import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const Url = process.env.SUPABASE_URL;
const Key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(Url, Key);

// export async function insertToSupabase({fixture_id, home_team, away_team, kickoff_time, lineup_time }) {
//     try {
//         const { data, error } = await supabase
//             .from("fixtures")
//             .insert([
//                 {
//                     "fixture_id": fixture_id,
//                     "home_team": home_team,
//                     "away_team": away_team,
//                     "kickoff_time": kickoff_time,
//                     "lineup_time": lineup_time,
//                     "date": date   
//                 }
//             ]);

//         console.log("Forwarded Fixture:", home_team, "vs", away_team, "id: " + fixture_id);

//         if (error) {
//             console.error("Supabase Error:", error);
//             return;
//         }
//     } catch (err) {
//         console.error("Unexpected Error:", err);
//     }
// }; 

export async function getFixtures(date) {
    try {
        const { data, error } = await supabase
            .from("fixtures")
            .select("*").eq("date", date);

        if (data.length === 0) {
            console.log("No Scheduled Matches Found");
            return [];
        }

        console.log(data);
        console.log("LOGGING DATA");
        return data;

    } catch (error) {
        console.log(error);
    }
};
// console.log(await getFixtures("06/15/202"));

async function updateFixtureStatus(e, d) {
    const { data, error} = await supabase
        .from("fixtures")
        .update({
            status: e === "live" ? "live" : "scheduled"
        })
        .eq("date", d)

    console.log(data);
    console.log(error);
}

// updateFixtureStatus("live", "06/16/2026");