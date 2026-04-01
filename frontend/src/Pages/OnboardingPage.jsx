import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { LoaderIcon } from "react-hot-toast";
import { completeOnboarding } from "../lib/api.js";
import {
  CameraIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
} from "lucide-react";
import { LANGUAGES } from "../constants/index.js";

function OnboardingPage() {
  const { isLoading, authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilepic: authUser?.profilepic || "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success(" profile onboarding succesfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formState);
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 1000);

    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;

    setFormState((prev) => ({
      ...prev,
      profilepic: randomAvatar,
    }));

    toast.success("Avatar changed successfully");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* image priview */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilepic ? (
                  <img
                    src={formState.profilepic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              {/* generate random avtar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Gererate Random Avtar
                </button>
              </div>
            </div>

            {/* full name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input file-input-bordered w-full"
                placeholder="Yor full name"
              />
            </div>
            {/* bio */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-boarded h-24"
                placeholder="Tell other about yourself and your language learning goals"
              />
            </div>
            {/* languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Native Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>

                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>

                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Learning Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>

                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your learning language</option>

                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon
                  className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5
               text-base-content opacity-70"
                />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City,Country"
                />
              </div>
            </div>
            {/* submit button */}
            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
