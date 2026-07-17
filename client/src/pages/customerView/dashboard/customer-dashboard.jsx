import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "@/redux/slices/userSlice";

const CustomerDashboard = () => {
	const dispatch = useDispatch();
	const profile = useSelector((state) => state.user.profile);

	useEffect(() => {
		dispatch(fetchProfile());
	}, [dispatch]);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">Customer Dashboard</h1>
			<p className="mt-4">Welcome {profile?.name || "user"}.</p>
			<div className="mt-6">
				<a href="/user/profile" className="text-primary underline">Edit Profile</a>
			</div>
		</div>
	);
};

export default CustomerDashboard;

