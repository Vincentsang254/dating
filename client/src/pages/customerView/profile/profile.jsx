import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile, uploadProfilePhoto, deleteProfilePhoto, reorderProfilePhotos } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const [form, setForm] = useState({ name: "", bio: "", interests: "", location: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setForm({ name: profile.name || "", bio: profile.bio || "", interests: profile.interests || "", location: profile.location || "" });
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    dispatch(updateProfile(form));
    setError("");
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }
    
    setSelectedFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      dispatch(uploadProfilePhoto(selectedFile));
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const photos = (profile?.photos || "").split(",").map((p) => p.trim()).filter(Boolean);

  const handleDelete = (url) => {
    dispatch(deleteProfilePhoto(url));
  };

  const movePhoto = (index, dir) => {
    const arr = [...photos];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= arr.length) return;
    const temp = arr[newIndex];
    arr[newIndex] = arr[index];
    arr[index] = temp;
    dispatch(reorderProfilePhotos(arr));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600">Complete your profile to attract meaningful connections</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Current/Preview Photo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300">
                  <img 
                    src={preview || profile?.profilePic || "/placeholder.png"} 
                    alt="profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <label className="block mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload a photo</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (Max 5MB)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden"
                    />
                  </div>
                </label>
                {selectedFile && (
                  <Button 
                    type="button" 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          {photos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h2>
              <p className="text-sm text-gray-600 mb-4">Organize your photos by dragging them</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((p, i) => (
                  <div key={p} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-300">
                      <img src={p} alt={`photo-${i}`} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Photo Controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, -1)}
                        disabled={i === 0}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, 1)}
                        disabled={i === photos.length - 1}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="Your full name"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text"
                  value={form.location} 
                  onChange={(e) => setForm({ ...form, location: e.target.value })} 
                  placeholder="City, Country"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" 
                />
              </div>
            </div>
          </div>

          {/* About You Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About You</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  value={form.bio} 
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                  placeholder="Tell us about yourself... (max 500 characters)"
                  maxLength="500"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">{form.bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                <textarea 
                  value={form.interests} 
                  onChange={(e) => setForm({ ...form, interests: e.target.value })} 
                  placeholder="What are you passionate about? (e.g., traveling, hiking, cooking)"
                  maxLength="500"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">{form.interests.length}/500 characters</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button 
              type="submit" 
              size="lg"
              className="flex-1"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
