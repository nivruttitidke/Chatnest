import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  SpeakerLayout,
  StreamTheme,
  useCallStateHooks,
  CallControls,
  CallingState,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY =
  import.meta.env.VITE_STREAM_API_KEY;

function CallPage() {
  const { id: callId } = useParams();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] =
    useState(true);

  const { authUser, isLoading } =
    useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      // SAFE CHECK
      if (
        !tokenData?.token ||
        !authUser ||
        !callId
      )
        return;

      try {
        console.log(
          "video call start..."
        );

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilepic,
        };

        const videoClient =
          new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user,
            token: tokenData.token,
          });

        const callInstance =
          videoClient.call(
            "default",
            callId
          );

        await callInstance.join({
          create: true,
        });

        console.log(
          "joined call successfully"
        );

        setClient(videoClient);
        setCall(callInstance);

      } catch (error) {
        console.error(
          "Error in join call:",
          error
        );

        toast.error(
          "Could not join the call"
        );

      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // CLEANUP
    return () => {
      if (call) call.leave();
      if (client)
        client.disconnectUser();
    };

  }, [
    tokenData,
    authUser,
    callId,
  ]);

  // FIXED LOADER
  if (isLoading || isConnecting)
    return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full">

        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>
              Could not initialize call.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

const CallContent = () => {
  const { useCallCallingState } =
    useCallStateHooks();

  const callState =
    useCallCallingState();

  const navigate =
    useNavigate();

  if (
    callState === CallingState.LEFT
  ) {
    navigate("/");
    return null;
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;