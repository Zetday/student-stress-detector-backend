import { useState } from "react";
import ProfileAvatarCard from "../components/profile/ProfileAvatarCard";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import AccountStatsSection from "../components/profile/AccountStatsSection";
import PasswordCard from "../components/profile/PasswordCard";
import DangerZoneCard from "../components/profile/DangerZoneCard";
import Layout from "../../layouts/Layout";
import { useUser } from "../contexts/UserContext";

// Dummy data untuk profile
const profile = {
  name: "Aryanda",
  fullName: "Aryanda Sanggadiennata",
  email: "aryanda@email.com",
  avatar: "/api/placeholder/120",
  role: "Student",
};

// Dummy data untuk statistik akun
const accountStats = [
  {
    title: "Total Analysis Entries",
    value: "1,284",
    suffix: "",
    trend: "+12%",
    progress: 80,
    description: null,
    icon: null,
    showIcon: false,
  },
  {
    title: "Average Stress Score",
    value: "42",
    suffix: "/100",
    trend: null,
    progress: null,
    description: "Optimal clinical range detected",
    icon: null,
    showIcon: false,
  },
  {
    title: "Active Streak",
    value: "18",
    suffix: "days",
    trend: null,
    progress: 85,
    description: null,
    icon: "lightning",
    showIcon: true,
  },
];

function ProfilePage() {
  const { user, setUser } = useUser();
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);

  const handleEditPhoto = () => {
    document.getElementById("avatar-upload")?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setHasNewPhoto(true);
  };

  const handleSavePhoto = () => {
    if (!selectedImage) return;

    setUser({
      ...user,
      profileImage: selectedImage,
    });

    setHasNewPhoto(false);

    alert("Profile photo updated successfully");
  };

  const handleUpdateInfo = () => {
    setIsUpdatingInfo(true);
    // Handle info update logic
    alert("Update information functionality would open a modal/dialog");
  };

  const handlePasswordSubmit = (data) => {
    console.log("Password change submitted:", data);
    alert("Password change submitted (check console for details)");
  };

  const handleDeactivateAccount = () => {
    if (confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      console.log("Account deactivation initiated");
      alert("Account deactivation initiated (check console for details)");
    }
  };

  return (
    <Layout title="Profile" name={user.fullname} role={user.role}>
      <div className="space-y-8">

        {/* Hidden Upload */}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* =====================================
            PROFILE HEADER (FULL WIDTH)
        ===================================== */}
        <ProfileAvatarCard
          image={user.profileImage}
          name={user.fullname || profile.name}
          role={user.role || profile.role}
          onEdit={handleEditPhoto}
          onSavePhoto={handleSavePhoto}
          hasNewPhoto={hasNewPhoto}
        />

        {/* =====================================
            CONTENT AREA
        ===================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            <ProfileInfoCard
              fullName={user.fullname}
              email={profile.email}
              onUpdate={handleUpdateInfo}
            />

            <PasswordCard
              onSubmit={handlePasswordSubmit}
            />

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">

            <div className="mb-4">
              <h2 className="theme-subtle text-[11px] font-bold uppercase tracking-[0.25em]">
                Statistik Akun
              </h2>
            </div>

            <AccountStatsSection
              stats={accountStats}
            />

          </div>
        </div>

        {/* =====================================
            DANGER ZONE
        ===================================== */}
        <DangerZoneCard
          onDeactivate={handleDeactivateAccount}
        />

      </div>
    </Layout>
  );
}

export default ProfilePage;
