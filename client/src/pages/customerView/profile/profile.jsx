import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile, uploadProfilePhoto, deleteProfilePhoto, reorderProfilePhotos } from "@/redux/slices/userSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const [form, setForm] = useState({ name: "", bio: "", interests: "", location: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setForm({ name: profile.name || "", bio: profile.bio || "", interests: profile.interests || "", location: profile.location || "" });
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(form));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setSelectedFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    dispatch(uploadProfilePhoto(selectedFile));
    setSelectedFile(null);
    setPreview(null);
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
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <img src={preview || profile?.profilePic || "/placeholder.png"} alt="profile" className="w-24 h-24 object-cover rounded" />
            </div>
            <div className="flex flex-col">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {selectedFile && (
                <button type="button" onClick={handleUpload} className="mt-2 bg-primary text-white px-3 py-1 rounded">Upload Photo</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={p} className="relative">
                <img src={p} alt={`photo-${i}`} className="w-full h-24 object-cover rounded" />
                <div className="absolute top-1 right-1 flex space-x-1">
                  <button type="button" onClick={() => movePhoto(i, -1)} className="bg-white/80 px-1 rounded">▲</button>
                  <button type="button" onClick={() => movePhoto(i, 1)} className="bg-white/80 px-1 rounded">▼</button>
                  <button type="button" onClick={() => handleDelete(p)} className="bg-red-600 text-white px-1 rounded">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border px-3 py-2 rounded" />
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full border px-3 py-2 rounded" rows={4} />
        <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="w-full border px-3 py-2 rounded" />
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border px-3 py-2 rounded" />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
