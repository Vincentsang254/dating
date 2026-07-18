/* eslint-disable react/prop-types */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageSquare, Star, CreditCard, Settings, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";

const navItems = [
	{ id: "dashboard", label: "Discover", path: "/user/dashboard", icon: Home },
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
			className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
				active 
					? "bg-primary/10 text-primary border-l-4 border-primary" 
					: "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
			}`}
		>
			<Icon className="w-5 h-5" />
			<span>{item.label}</span>
		</Link>
	);
};

const CustomerSidebar = ({ className = "w-72", open = false, setOpen = null }) => {
	const location = useLocation();
	const dispatch = useDispatch();

	const handleNavigate = () => {
		if (setOpen) setOpen(false);
	};

	const handleLogout = () => {
		dispatch(logoutUser());
		if (setOpen) setOpen(false);
	};

	return (
		<aside className={`${className} ${open ? "block" : "hidden lg:block"} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col h-screen shadow-sm`}>
			{/* Logo Section */}
			<div className="p-6 border-b border-gray-200">
				<div className="mb-2 flex items-center justify-between">
					<h3 className="text-xl font-bold text-primary">SparkMatch</h3>
					{setOpen && (
						<button
							onClick={() => setOpen(false)}
							className="lg:hidden text-sm text-gray-500 hover:text-gray-900"
						>
							Close
						</button>
					)}
				</div>
				<p className="text-xs text-gray-500">Connect with meaningful people</p>
			</div>

			{/* Navigation */}
			<nav className="flex-1 flex flex-col space-y-1 p-4 overflow-y-auto">
				{navItems.map((item) => (
					<SidebarItem
						key={item.id}
						item={item}
						active={location.pathname.startsWith(item.path)}
						onNavigate={handleNavigate}
					/>
				))}
			</nav>

			{/* Footer Section */}
			<div className="p-4 border-t border-gray-200 space-y-2">
				<Link 
					to="/user/settings" 
					onClick={handleNavigate}
					className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all"
				>
					<Settings className="w-5 h-5" />
					<span>Settings</span>
				</Link>
				<button 
					onClick={handleLogout}
					className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all"
				>
					<LogOut className="w-5 h-5" />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
};

export default CustomerSidebar;

