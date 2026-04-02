import axios from "axios";
export const axiosInstance = axios.create({
    baseURL: "https://chatnest-ag0g.onrender.com/api",
    withCredentials: true //send the cookies
});

