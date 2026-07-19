import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserProfile, reportUser } from "@/redux/slices/userSlice";
import { likeUser } from "@/redux/slices/matchingSlice";
import { getOrCreateConversation, setCurrentConversation } from "@/redux/slices/messagingSlice";
import { Heart, MessageCircle, Phone, Video, ArrowLeft, AlertCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

const ViewProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { viewedProfile, viewedProfileStatus } = useSelector((state) => state.user);
  const { id: currentUserId } = useSelector((state) => state.auth);
  const { userFeatures } = useSelector((state) => state.messaging);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  const handleLike = () => {
    if (!userId) return;
    dispatch(likeUser(userId));
  };

  const handleMessage = async () => {
    if (!userId) return;
    const resultAction = await dispatch(getOrCreateConversation(userId));
    if (getOrCreateConversation.fulfilled.match(resultAction)) {
      dispatch(setCurrentConversation(resultAction.payload));
      navigate(`/user/messages/${resultAction.payload.id}`);
    }
  };

  const handleCall = (type) => {
    if (!userId) return;
    const callType = type === "voice" ? "voice" : "video";
    if (!userFeatures.features[callType === "voice" ? "voiceCalls" : "videoCalls"]) {
      alert(`${callType === "voice" ? "Voice" : "Video"} calls are available for Premium users only.`);
      return;
    }
    navigate(`/user/messages?userId=${userId}&callType=${callType}`);
  };

  const handleReport = () => {
    if (!userId) return;
    const reason = window.prompt("Please tell us why you are reporting this user:");
    if (!reason) return;
    dispatch(reportUser({ reportedUserId: userId, reason }));
  };

  const handleBlock = () => {
    if (!userId) return;
    if (window.confirm("Are you sure you want to block this user?")) {
      dispatch(blockUser({ blockedUserId: userId }));
      navigate("/user/discover");
    }
  };

  if (viewedProfileStatus === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900">Profile unavailable</h2>
          <p className="text-gray-600 mt-2">This profile could not be loaded right now.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const photos = (viewedProfile?.photos || "").split(",").map((p) => p.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-72 bg-gray-200">
            <img src={viewedProfile?.profilePic || "/placeholder.png"} alt={viewedProfile?.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{viewedProfile?.name}</h1>
                <p className="text-gray-600 mt-1">{viewedProfile?.location || "Location not shared"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleLike} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <Heart className="w-4 h-4" />
                  Like
                </Button>
                <Button variant="outline" onClick={handleMessage} className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button variant="outline" onClick={() => handleCall("voice")} className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Voice Call
                </Button>
                <Button variant="outline" onClick={() => handleCall("video")} className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Call
                </Button>
                <Button variant="destructive" onClick={handleReport} className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Report
                </Button>
                <Button variant="destructive" onClick={handleBlock} className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Block
                </Button>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">About</h2>
                  <p className="text-gray-700 mt-2">{viewedProfile?.bio || "No bio added yet."}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Interests</h2>
                  <p className="text-gray-700 mt-2">{viewedProfile?.interests || "No interests listed yet."}</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Gallery</h2>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {photos.map((photo, index) => (
                      <img key={`${photo}-${index}`} src={photo} alt={`photo-${index}`} className="h-28 w-full object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-3">No additional photos uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfilePage;
