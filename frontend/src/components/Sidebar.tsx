import { NavLink } from "react-router-dom";
import { Home, Upload, Beaker, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function Sidebar() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Beaker className="h-6 w-6" />
          <span>MDO</span>
        </NavLink>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "justify-start"
              )
            }
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "justify-start"
              )
            }
          >
            <Upload className="mr-2 h-4 w-4" />
            New Run
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "justify-start",
                "cursor-not-allowed opacity-50"
              )
            }
            onClick={(e) => e.preventDefault()}
          >
            <History className="mr-2 h-4 w-4" />
            Run History
          </NavLink>
        </nav>
      </div>
    </div>
  );
}