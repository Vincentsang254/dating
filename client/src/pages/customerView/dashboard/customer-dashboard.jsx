import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "@/redux/slices/userSlice";
import { discoverUsers, getLikesReceived, getUserMatches } from "@/redux/slices/matchingSlice";
import { getConversations, getUnreadCount } from "@/redux/slices/messagingSlice";
import { Heart, MessageCircle, Zap, TrendingUp, Users, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
	const dispatch = useDispatch();
	const profile = useSelector((state) => state.user.profile);
	const suggestedUsers = useSelector((state) => state.matching.discoverUsers);
	const likesReceived = useSelector((state) => state.matching.likesReceived);
	const matches = useSelector((state) => state.matching.matches);
	const conversations = useSelector((state) => state.messaging.conversations);
	const unreadCount = useSelector((state) => state.messaging.unreadCount);

	useEffect(() => {
		dispatch(fetchProfile());
		dispatch(getLikesReceived());
		dispatch(getUserMatches());
		dispatch(getConversations({ limit: 8, offset: 0 }));
		dispatch(getUnreadCount());
		dispatch(discoverUsers({ limit: 8, offset: 0 }));
	}, [dispatch]);

	const completionItems = [
		profile?.profilePic,
		profile?.bio,
		profile?.interests,
		profile?.location,
	];

	const completedCount = completionItems.filter(Boolean).length;
	const completionPercent = Math.round((completedCount / completionItems.length) * 100);

	const StatCard = ({ icon: Icon, label, value, color }) => (
		<div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-slate-500">{label}</p>
					<p className="text-4xl font-semibold text-slate-900 mt-3">{value ?? 0}</p>
				</div>
				<div className={`inline-flex items-center justify-center rounded-2xl p-4 ${color}`}>
					<Icon className="w-6 h-6 text-white" />
				</div>
			</div>
		</div>
	);

	const QuickAction = ({ icon: Icon, label, description, href }) => (
		<Link
			to={href}
			className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
		>
			<div className="flex items-center gap-4">
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary/20">
					<Icon className="w-5 h-5" />
				</div>
				<div>
					<h3 className="text-base font-semibold text-slate-900">{label}</h3>
					<p className="text-sm text-slate-500">{description}</p>
				</div>
			</div>
			<span className="text-sm font-medium text-primary">Go to {label.split(" ")[0]}</span>
		</Link>
	);

	return (
		<div className="min-h-screen bg-slate-50 py-10 px-4">
			<div className="mx-auto max-w-7xl space-y-8">
				<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-3xl">
							<p className="text-sm uppercase tracking-[0.24em] text-primary">Dashboard</p>
							<h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
								Welcome back, {profile?.name || "there"}.
							</h1>
							<p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
								{profile?.bio || "Your profile is ready to attract better matches. Here is what’s happening in your community."}
							</p>
							<div className="mt-6 flex flex-wrap gap-3">
								<Link to="/user/profile" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
									Edit Profile
								</Link>
								<Link to="/user/discover" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
									Discover
								</Link>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:w-[360px]">
							<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
								<p className="text-sm text-slate-500">Profile strength</p>
								<p className="mt-3 text-2xl font-semibold text-slate-900">{completionPercent}%</p>
								<p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">Completed</p>
							</div>
							<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
								<p className="text-sm text-slate-500">Matches</p>
								<p className="mt-3 text-2xl font-semibold text-slate-900">{matches?.length ?? 0}</p>
							</div>
							<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
								<p className="text-sm text-slate-500">New messages</p>
								<p className="mt-3 text-2xl font-semibold text-slate-900">{unreadCount ?? 0}</p>
							</div>
							<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
								<p className="text-sm text-slate-500">Suggested</p>
								<p className="mt-3 text-2xl font-semibold text-slate-900">{suggestedUsers?.length ?? 0}</p>
							</div>
						</div>
					</div>
				</section>

				<div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
					<div className="space-y-8">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<StatCard icon={Heart} label="Likes Received" value={likesReceived?.length ?? 0} color="bg-red-500" />
							<StatCard icon={MessageCircle} label="Conversations" value={conversations?.length ?? 0} color="bg-blue-500" />
							<StatCard icon={Users} label="Matches" value={matches?.length ?? 0} color="bg-purple-500" />
							<StatCard icon={TrendingUp} label="New messages" value={unreadCount ?? 0} color="bg-emerald-500" />
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<QuickAction icon={Heart} label="Discover Matches" description="Browse profiles ready to connect." href="/user/discover" />
							<QuickAction icon={MessageCircle} label="Open Messages" description="Continue your latest conversations." href="/user/messages" />
							<QuickAction icon={Star} label="Go Premium" description="Unlock premium features and boosts." href="/user/vip" />
							<QuickAction icon={Zap} label="Boost Profile" description="Get more visibility from active users." href="/user/payments" />
						</div>

						<section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
							<div className="mb-5 flex items-center justify-between gap-4">
								<div>
									<h2 className="text-xl font-semibold text-slate-900">Suggested Profiles</h2>
									<p className="text-sm text-slate-500">Based on your current activity and matches.</p>
								</div>
								<Link to="/user/discover" className="text-sm font-semibold text-primary">See all</Link>
							</div>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{suggestedUsers?.length > 0 ? (
									suggestedUsers.slice(0, 4).map((user) => (
										<div key={user.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
											<img
												src={user.profilePic || "/placeholder.png"}
												alt={user.name}
												className="h-40 w-full object-cover"
											/>
											<div className="p-4">
												<h3 className="font-semibold text-slate-900">{user.name}</h3>
												<p className="mt-1 text-sm text-slate-500">{user.location || "Nearby"}</p>
												<p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{user.bio || "Bio not available."}</p>
												<div className="mt-4 flex items-center justify-between gap-3">
													<p className="text-xs uppercase tracking-[0.18em] text-slate-400">{user.age ? `${user.age} yrs` : "Age N/A"}</p>
													<Link to={`/user/profile/${user.id}`} className="text-sm font-semibold text-primary">
														View
													</Link>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
										No suggested profiles are available right now.
									</div>
								)}
							</div>
						</section>
					</div>

					<aside className="space-y-6">
						<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-center gap-4">
								<div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
									<img
										src={profile?.profilePic || "/placeholder.png"}
										alt={profile?.name || "Profile"}
										className="h-24 w-24 object-cover"
									/>
								</div>
								<div>
									<h2 className="text-xl font-semibold text-slate-900">{profile?.name || "Your profile"}</h2>
									<p className="text-sm text-slate-500">{profile?.location || "Location not set"}</p>
								</div>
							</div>
							<div className="mt-6 space-y-3 text-sm text-slate-600">
								<p>{profile?.bio || "You haven’t added a bio yet."}</p>
								<p>{profile?.interests ? `Interests: ${profile.interests}` : "Add a few interests to help matches find you."}</p>
								<p>{profile?.gender || profile?.age ? `${profile?.gender || ""}${profile?.gender && profile?.age ? ", " : ""}${profile?.age ? `${profile.age} years old` : ""}` : "Share more details to improve your discoverability."}</p>
							</div>
						</div>

						<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-lg font-semibold text-slate-900">Profile Progress</h2>
									<p className="text-sm text-slate-500">Complete these items to attract more matches.</p>
								</div>
								<span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{completionPercent}%</span>
							</div>
							<div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
								<div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500" style={{ width: `${completionPercent}%` }} />
							</div>
							<ul className="mt-5 space-y-3 text-sm text-slate-600">
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
									<span>{profile?.profilePic ? "Profile photo added" : "Add a profile photo"}</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
									<span>{profile?.bio ? "Bio completed" : "Write a short bio"}</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
									<span>{profile?.interests ? "Interests added" : "Add interests"}</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
									<span>{profile?.location ? "Location set" : "Add location"}</span>
								</li>
							</ul>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default CustomerDashboard;

