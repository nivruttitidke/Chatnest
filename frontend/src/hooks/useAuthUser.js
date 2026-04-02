import { getAuthUser } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const useAuthUser = () => {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,

    onError: (error) => {
      if (error?.response?.status === 401) {
        navigate("/login");
      }
    },
  });

  return {
    isLoading: query.isLoading,
    authUser: query.data?.user,
  };
};

export default useAuthUser;