import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export async function fetchTodayFixtures() {
    const today = new Date().toISOString().split("T")[0];
    console.log(today);
    
    const URL = `https://v3.football.api-sports.io/fixtures?date=${today}`;

    const PARAMS = {
        headers : {
            "x-apisports-key": process.env.API_SPORT_KEY,
        }
    };

    try {
        const response = await axios.get(URL, PARAMS);
        const fixtures = response.data.response;
        
        // console.log(fixtures);
        console.log("Fixtures:", fixtures.length);
        
        return fixtures;
    } catch (err) {
        console.log(err);
        return [];
    }
};


// fetchTodayFixtures();