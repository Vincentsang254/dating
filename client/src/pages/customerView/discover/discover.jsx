import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { discoverUsers, likeUser, unlikeUser } from "@/redux/slices/matchingSlice";
import { Heart, X, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DiscoverPage = () => {
  const dispatch = useDispatch();
  const {
    discoverUsers: users,
    currentDiscoverIndex,
    discoverLoading,
    discoverError,
    loading,
  } = useSelector((state) => state.matching);

  useEffect(() => {
    dispatch(discoverUsers({ limit: 20, offset: 0 }));
  }, [dispatch]);

  const currentUser = users[currentDiscoverIndex];

  const handleLike = () => {
    if (currentUser) {
      dispatch(likeUser(currentUser.id));
    }
  };

  const handlePass = () => {
    if (currentUser) {
      dispatch(unlikeUser(currentUser.id));
    }
  };

  if (discoverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (discoverError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Error Loading Profiles</h3>
              <p className="text-sm text-gray-600 mt-1">{discoverError}</p>
            </div>
          </div>
          <Button
            onClick={() => dispatch(discoverUsers({ limit: 20, offset: 0 }))}
            className="w-full mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profiles Available</h2>
          <p className="text-gray-600 mb-6">Check back later for more profiles to discover</p>
          <Button onClick={() => dispatch(discoverUsers({ limit: 20, offset: 0 }))}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (currentDiscoverIndex >= users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done for Now!</h2>
          <p className="text-gray-600 mb-6">
            You've gone through all available profiles. Check back later!
          </p>
          <Button onClick={() => dispatch(discoverUsers({ limit: 20, offset: 0 }))}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-600">
            Profile {currentDiscoverIndex + 1} of {users.length}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Image Section */}
          <div className="relative h-96 bg-gray-200 overflow-hidden">
            <img
              src={currentUser?.profilePic || "/placeholder.png"}
              alt={currentUser?.name}
              className="w-full h-full object-cover"
            />
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h2 className="text-3xl font-bold text-white">
                {currentUser?.name}{currentUser?.age && `, ${currentUser.age}`}
              </h2>
              {currentUser?.location && (
                <p className="text-gray-200 text-sm mt-1">{currentUser.location}</p>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6">
            {/* Bio */}
            {currentUser?.bio && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700">{currentUser.bio}</p>
              </div>
            )}

            {/* Interests */}
            {currentUser?.interests && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Interests</h3>
                <p className="text-gray-700">{currentUser.interests}</p>
              </div>
            )}

            {/* Photos */}
            {currentUser?.photos && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">More Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentUser.photos
                    .split(",")
                    .slice(0, 3)
                    .map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo.trim()}
                        alt={`photo-${idx}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <Button
                  onClick={handlePass}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Pass
                </Button>
                <Button
                  onClick={handleLike}
                  disabled={loading}
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Heart className="w-5 h-5" />
                  Like
                </Button>
              </div>
              <Link to={`/user/profile/${currentUser?.id}`}>
                <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5" />
                  View Full Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex justify-center gap-2">
          {users.slice(currentDiscoverIndex, currentDiscoverIndex + 3).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-colors ${
                idx === 0 ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
