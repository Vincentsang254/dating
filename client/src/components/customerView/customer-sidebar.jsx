/* eslint-disable react/prop-types */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageSquare, Star, CreditCard, Settings, LogOut, Heart, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";

const baseNavItems = [
	{ id: "discover", label: "Discover", path: "/user/discover", icon: Home },
	{ id: "matches", label: "Matches", path: "/user/matches", icon: Heart },
	{ id: "profile", label: "Profile", path: "/user/profile", icon: User },
	{ id: "messages", label: "Messages", path: "/user/messages", icon: MessageSquare },
	{ id: "vip", label: "Premium", path: "/user/vip", icon: Star },
	{ id: "payments", label: "Boosts", path: "/user/payments", icon: CreditCard },
];

const SidebarItem = ({ item, active, onNavigate }) => {
	const Icon = item.icon;
	return (
		<Link
			to={item.path}
			onClick={onNavigate}
			className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
				active
					? "border border-primary/20 bg-primary/10 text-primary shadow-sm"
					: "border border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900"
			}`}
		>
			<Icon className="h-5 w-5" />
			<span>{item.label}</span>
		</Link>
	);
};

const CustomerSidebar = ({ className = "w-72", open = false, setOpen = null }) => {
	const location = useLocation();
	const dispatch = useDispatch();
	const { userType } = useSelector((state) => state.auth);

	const handleNavigate = () => {
		if (setOpen) setOpen(false);
	};

	const navItems = [
		...baseNavItems,
		...(userType === "admin"
			? [{ id: "admin-dashboard", label: "Admin Dashboard", path: "/admin/dashboard", icon: Shield }]
			: []),
	];

	const handleLogout = () => {
		dispatch(logoutUser());
		if (setOpen) setOpen(false);
	};

	return (
		<aside className={`${className} ${open ? "block" : "hidden lg:block"} flex h-screen flex-col border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-sm`}>
			<div className="border-b border-slate-200 p-6">
				<div className="mb-2 flex items-center justify-between">
					<h3 className="text-xl font-bold text-primary">SparkMatch</h3>
					{setOpen && (
						<button
							onClick={() => setOpen(false)}
							className="text-sm text-slate-500 hover:text-slate-900 lg:hidden"
						>
							Close
						</button>
					)}
				</div>
				<p className="text-xs text-slate-500">Connect with meaningful people</p>
			</div>

			<nav className="flex-1 space-y-1 overflow-y-auto p-4">
				{navItems.map((item) => (
					<SidebarItem
						key={item.id}
						item={item}
						active={location.pathname.startsWith(item.path)}
						onNavigate={handleNavigate}
					/>
				))}
			</nav>

			<div className="border-t border-slate-200 bg-white/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/70">
				<div className="space-y-2">
					<Link
						to="/user/settings"
						onClick={handleNavigate}
						className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
					>
						<Settings className="h-5 w-5" />
						<span>Settings</span>
					</Link>
					<button
						onClick={handleLogout}
						className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
					>
						<LogOut className="h-5 w-5" />
						<span>Logout</span>
					</button>
				</div>
			</div>
		</aside>
	);
};

export default CustomerSidebar;

