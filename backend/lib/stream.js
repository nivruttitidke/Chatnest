import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log(
    "Stream API key or Secret is missing"
  );
}

const streamClient =
  StreamChat.getInstance(
    apiKey,
    apiSecret
  );

export const upsertStreamUser = async (
  userData
) => {
  try {
    await streamClient.upsertUsers([
      {
        id: userData.id.toString(),
        name: userData.name,
        image: userData.image || "",
      },
    ]);

    console.log(
      `Stream user created for ${userData.name}`
    );

    return userData;

  } catch (error) {
    console.log(
      "error upserting Stream user:",
      error.message
    );
  }
};

export const generateStreamToken = (
  userId
) => {
  try {
    return streamClient.createToken(
      userId.toString()
    );
  } catch (error) {
    console.error(
      "error in generating stream token:",
      error.message
    );
  }
};