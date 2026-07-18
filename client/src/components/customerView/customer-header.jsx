/* eslint-disable react/prop-types */
import { HousePlug, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const menuItems = [
  { id: "home", label: "Discover", path: "/user/dashboard" },
  { id: "profile", label: "Profile", path: "/user/profile" },
  { id: "premium", label: "Premium", path: "/user/vip" },
];

function MenuItems({ close }) {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-col lg:flex-row gap-2 lg:gap-4 text-sm">
      {menuItems.map((item) => (
        <Label
          key={item.id}
          onClick={() => {
            navigate(item.path);
            close();
          }}
          className="px-2 py-1 rounded-md cursor-pointer hover:text-primary hover:bg-accent transition-colors"
        >
          {item.label}
        </Label>
      ))}
    </nav>
  );
}

function UserHeader({ setOpen = null }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14 px-4">
        {/* Left Section - Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen?.(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to="/user/dashboard" className="flex items-center gap-2">
            <HousePlug className="w-5 h-5 text-primary" />
            <span className="hidden sm:inline text-sm font-semibold">
              SparkMatch
            </span>
          </Link>
        </div>

        {/* Center - Desktop Menu */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <MenuItems close={() => {}} />
        </div>

      </div>
    </header>
  );
}

export default UserHeader;
