import { axiosInstance } from "./axios"

export const login = async(LoginData)=>{
    const response = await axiosInstance.post("/auth/login",LoginData);
    return response.data;
};

export const logout = async()=>{
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};

export const getAuthUser = async ()=>{
    try {
        const res = await axiosInstance.get("/auth/me");
    return res.data;
    } catch (error) {
        console.log("Error in getAuthuser:",error)
        return null;
    }
};

export const completeOnboarding = async(userData)=>{
    const response = await axiosInstance.post("/auth/onboarding",userData);
    return response.data;
};

export const getUserFriends = async()=>{
    const response = await axiosInstance.get("/users/friends");
    return response.data;
};

export const getRecommendedUsers = async()=>{
    const response = await axiosInstance.get("/users");
    return response.data;
};

export const getOutgoingFriendReq = async()=>{
    const response = await axiosInstance.get("/users/outgoing-friend-request");
    return response.data;
};

export const sendFriendRequest = async(userId)=>{
    const response = await axiosInstance.post(`/users/friend-request/${userId}`);
    return response.data;
};

export const getFriendRequest = async()=>{
    const response = await axiosInstance.get("/users/friend-request");
    return response.data;
};

export const acceptFriendRequest = async(requestId) =>{
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
    return response.data;
};

export async function getStreamToken() {
 const response = await axiosInstance.get("/chat/token");
 return response.data;   
}

