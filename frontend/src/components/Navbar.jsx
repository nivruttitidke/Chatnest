import { Link, useLocation ,useNavigate} from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

function Navbar() {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {mutate:logoutMutation} = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success(" profile logout succesfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"], Value:null });
       navigate("/login");
    },
   
  });
  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-15 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {isChatPage && (
            <div className="pl-5">
              <Link to={"/"} className="flex items-center gap-2.5 ">
                <ShipWheelIcon className="size-9 text-primary justify-start" />
                <span
                  className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r
             from-primary to-secondary tracking-wider"
                >
                  ChatNest
                </span>
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notification"}>
             <button className="btn btn-ghost btn-circle">
              <BellIcon className="h-6 text-base-content opacity-70" />
             </button>
            </Link>
          </div>
          {/* themeselector */}
          <ThemeSelector />
          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={authUser?.profilepic} alt="user avatar" rel="noreferrer" />
            </div>
        </div>
        {/* logoutbutton */}
        <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
          <LogOutIcon className="h-6 w-6 text-base-content opacity-70"/>
        </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
