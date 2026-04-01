import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReq,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import toast from "react-hot-toast";
function HomePage() {
  const queryClient = useQueryClient();
  const [outgoingReqId, setOutgoingReqId] = useState(new Set());
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUser = [], isLoading: loadingUser } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReq } = useQuery({
    queryKey: ["outgoingFriendReq"],
    queryFn: getOutgoingFriendReq,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success(" Friend request send succesfully");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReq"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReq && outgoingFriendReq.length > 0) {
      outgoingFriendReq.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingReqId(outgoingIds);
    }
  }, [outgoingFriendReq]);

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link to={"/notification"} className="btn btn-outline btn-sm">
            <UserIcon className="mr-2 size-6" />
            Friend Requests
          </Link>
        </div>
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Friend
                </h2>
                <p className="opacity-70">Discover perfect soulmate for you</p>
              </div>
            </div>
          </div>
          {loadingUser ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUser.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h2 className="font-semibold text-lg mb-2">No recommendation</h2>
              <p className="text-base-content opacity-70">
                Check after some time !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUser.map((user) => {
                const hasRequestBeenSent = outgoingReqId?.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilepic} alt={user.fullName} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* language with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native:{capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Learning:{capitialize(user.nativeLanguage)}
                        </span>
                      </div>
                      {user.bio && (
                        <p className="text-sm opacity-70">{user.bio}</p>
                      )}
                      {/* button */}

                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => mutate(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;

function capitialize(str) {
  if (!str) return "";

  return str.charAt(0).toUpperCase() + str.slice(1);
}
