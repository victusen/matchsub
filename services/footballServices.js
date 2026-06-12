import axios from "axios";

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
        console.log(response.data.errors);
        
        console.log("Fixtures:", fixtures.length);
        return fixtures;
    } catch (err) {
        console.log(err);
        return [];
    }
};

// fetchTodayFixtures();