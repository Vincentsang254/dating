import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "@/redux/slices/userSlice";
import { Heart, MessageCircle, Zap, TrendingUp, Users, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
	const dispatch = useDispatch();
	const profile = useSelector((state) => state.user.profile);
	const [stats] = useState({
		likes: 24,
		messages: 8,
		matches: 12,
		profile_views: 156
	});

	useEffect(() => {
		dispatch(fetchProfile());
	}, [dispatch]);

	const StatCard = ({ icon: Icon, label, value, color }) => (
		<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{label}</p>
					<p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
				</div>
				<div className={`p-3 rounded-lg ${color}`}>
					<Icon className="w-6 h-6 text-white" />
				</div>
			</div>
		</div>
	);

	const QuickAction = ({ icon: Icon, label, description, onClick, href }) => {
		const Component = href ? Link : "button";
		const props = href ? { to: href } : { onClick };
		
		return (
			<Component
				{...props}
				className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-primary hover:shadow-md transition-all text-left"
			>
				<div className="flex items-center gap-4">
					<div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
						<Icon className="w-6 h-6 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-gray-900">{label}</h3>
						<p className="text-sm text-gray-600">{description}</p>
					</div>
				</div>
			</Component>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						Welcome back, {profile?.name || "there"}! 👋
					</h1>
					<p className="text-gray-600">
						{profile?.bio || "Complete your profile to start meaningful connections"}
					</p>
				</div>

				{/* Profile Completion Status */}
				{profile && (
					<div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
								<p className="text-sm text-gray-600">
									{profile.profilePic ? "✓ " : ""}Profile photo
									{profile.bio ? " • ✓ Bio" : " • Bio"} 
									{profile.interests ? " • ✓ Interests" : " • Interests"}
								</p>
							</div>
							<Link to="/user/profile">
								<Button className="bg-primary hover:bg-primary/90">Edit Profile</Button>
							</Link>
						</div>
					</div>
				)}

				{/* Stats Grid */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Your Activity</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<StatCard 
							icon={Heart} 
							label="Likes Received" 
							value={stats.likes}
							color="bg-red-500"
						/>
						<StatCard 
							icon={MessageCircle} 
							label="Messages" 
							value={stats.messages}
							color="bg-blue-500"
						/>
						<StatCard 
							icon={Users} 
							label="Matches" 
							value={stats.matches}
							color="bg-purple-500"
						/>
						<StatCard 
							icon={TrendingUp} 
							label="Profile Views" 
							value={stats.profile_views}
							color="bg-green-500"
						/>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<QuickAction
							icon={Heart}
							label="Discover Matches"
							description="Browse and like profiles near you"
							href="/user/dashboard"
						/>
						<QuickAction
							icon={MessageCircle}
							label="View Messages"
							description="Check your conversations"
							href="/user/messages"
						/>
						<QuickAction
							icon={Star}
							label="Get Premium"
							description="Unlock exclusive features"
							href="/user/vip"
						/>
						<QuickAction
							icon={Zap}
							label="Boost Profile"
							description="Get more visibility"
							href="/user/payments"
						/>
					</div>
				</div>

				{/* Tips Section */}
				<div className="bg-white rounded-lg border border-gray-200 p-6">
					<div className="flex items-center gap-3 mb-4">
						<Shield className="w-6 h-6 text-primary" />
						<h2 className="text-lg font-semibold text-gray-900">Connection Tips</h2>
					</div>
					<ul className="space-y-3 text-sm text-gray-700">
						<li className="flex gap-3">
							<span className="text-primary font-bold">✓</span>
							<span>Use a clear, recent photo to increase your match rate by 45%</span>
						</li>
						<li className="flex gap-3">
							<span className="text-primary font-bold">✓</span>
							<span>Write a genuine bio that showcases your personality and interests</span>
						</li>
						<li className="flex gap-3">
							<span className="text-primary font-bold">✓</span>
							<span>Respond to messages within 24 hours for better connections</span>
						</li>
						<li className="flex gap-3">
							<span className="text-primary font-bold">✓</span>
							<span>Keep your profile updated with recent photos and interests</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default CustomerDashboard;

