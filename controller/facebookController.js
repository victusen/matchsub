import axios from 'axios'
import dotenv from "dotenv";

dotenv.config();

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;

export const postToFacebook = async (message, imageUrl = "") => {
    try {
        const url = `https://graph.facebook.com/v25.0/${PAGE_ID}/feed`;

        const data = {
            message: message,
            access_token: PAGE_TOKEN,
            ...(imageUrl && { picture: imageUrl })
        }

        const res = await axios.post(url, data);
        return {
            success: true,
            postId: res.data.id,
            message: "post created successfully"
        }

    } catch (error) {
        const fbError = error.response?.data?.error?.message;
        const errorMessage = fbError || error.message;
        console.error("Facebook API Error:", errorMessage);
        
        return {
            success: false,
            message: errorMessage
        };
    }
};