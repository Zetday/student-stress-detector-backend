import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatarCard from "../components/profile/ProfileAvatarCard";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import PasswordCard from "../components/profile/PasswordCard";
import Layout from "../../layouts/Layout";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../services/api";
import { logout } from "../services/authService";
import { getApiUrl } from "../../api.config";

function ProfilePage() {
  const { user, setUser } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showPasswordSuccessPopup, setShowPasswordSuccessPopup] = useState(false);
  const [fullnameInput, setFullnameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleEditPhoto = () => {
    document.getElementById("avatar-upload")?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

     const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, WEBP allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5MB");
      return;
    }

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setHasNewPhoto(true);
  };

  const normalizeProfileImage = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) {
      return image;
    }

    return getApiUrl(`/uploads/images/${encodeURIComponent(image)}`);
  };

  const handleSavePhoto = async () => {
    try {
      if (!selectedFile) return;

      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const response = await api.put("/profiles/picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const imageUrl = response.data.data.profileImageUrl;

      setUser((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      setSelectedImage(null);
      setSelectedFile(null);
      setHasNewPhoto(false);
    } catch (error) {
      console.error("Upload avatar failed:", error);
    }
  };

  const handleUpdateInfo = () => {
    setUpdateError("");
    setFullnameInput(user.fullname || "");
    setEmailInput(user.email || "");
    setShowUpdatePopup(true);
  };

  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    setUpdateError("");
  };

  const handleFullnameChange = (e) => {
    setFullnameInput(e.target.value);
    setUpdateError("");
  };

  const handleEmailChange = (e) => {
    setEmailInput(e.target.value);
    setUpdateError("");
  };

  const handleSaveFullname = async () => {
    if (!fullnameInput.trim()) {
      setUpdateError(t.FullNameLabel + " tidak boleh kosong.");
      return;
    }

    if (!emailInput.trim()) {
      setUpdateError(t.EmailAddressLabel + " tidak boleh kosong.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.put(
        "/profiles/info",
        {
          fullname: fullnameInput.trim(),
          email: emailInput.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((prev) => ({
        ...prev,
        fullname: response.data.data.fullname || fullnameInput.trim(),
        email: response.data.data.email || emailInput.trim(),
      }));

      setShowUpdatePopup(false);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Gagal memperbarui informasi.";
      setUpdateError(message);
    }
  };

  const handlePasswordSubmit = async (data) => {
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = data;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t.PasswordRequiredError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.PasswordMismatchError);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t.PasswordMinLengthError);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await api.put(
        "/profiles/password",
        {
          oldPassword: currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordSuccess("");
      setShowPasswordSuccessPopup(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || t.PasswordUpdateError;
      setPasswordError(message);
    }
  };

  const handlePasswordSuccessPopupClick = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser({ fullname: "", email: "", role: "", profileImage: null, createdAt: null });
      navigate("/login", { replace: true });
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
          image={selectedImage || normalizeProfileImage(user.profileImage)}
          name={user.fullname}
          role={user.role}
          onEdit={handleEditPhoto}
          onSavePhoto={handleSavePhoto}
          hasNewPhoto={hasNewPhoto}
        />

        {/* =====================================
            CONTENT AREA
        ===================================== */}
        <div className="grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            <ProfileInfoCard
              fullName={user.fullname}
              email={user.email}
              onUpdate={handleUpdateInfo}
            />

            <PasswordCard
              onSubmit={handlePasswordSubmit}
              error={passwordError}
              success={passwordSuccess}
              t={t}
            />

          </div>
        </div>

        {showUpdatePopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
            onClick={handleCloseUpdatePopup}
          >
            <div
              className="w-full max-w-md rounded-3xl theme-card border theme-border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold theme-text">
                  {t.UpdateFullNameTitle || "Perbarui Nama Lengkap"}
                </h2>
                <p className="mt-2 text-sm theme-muted">
                  {t.UpdateFullNameDescription || "Masukkan nama lengkap baru Anda."}
                </p>
              </div>

              <label className="block text-sm font-medium theme-text mb-2">
                {t.FullNameLabel}
              </label>
              <input
                value={fullnameInput}
                onChange={handleFullnameChange}
                className="w-full rounded-2xl border theme-border bg-theme-card-muted px-4 py-3 text-sm theme-text outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.FullNameLabel}
              />

              <label className="block text-sm font-medium theme-text mb-2 mt-4">
                {t.EmailAddressLabel}
              </label>
              <input
                value={emailInput}
                onChange={handleEmailChange}
                className="w-full rounded-2xl border theme-border bg-theme-card-muted px-4 py-3 text-sm theme-text outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.EmailAddressLabel}
              />

              {updateError && (
                <p className="mt-3 text-sm text-red-500">{updateError}</p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseUpdatePopup}
                  className="inline-flex justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium theme-text hover:bg-white/5 transition"
                >
                  {t.CancelButton || "Kembali"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveFullname}
                  className="inline-flex justify-center rounded-2xl bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600 transition"
                >
                  {t.SaveChangesButton || "Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordSuccessPopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={handlePasswordSuccessPopupClick}
          >
            <div
              className="w-full max-w-md rounded-3xl theme-card border theme-border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold theme-text">
                  {t.PasswordSuccessTitle}
                </h2>
                <p className="mt-2 text-sm theme-muted">
                  {t.PasswordSuccessDescription}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium theme-text hover:bg-white/5 transition"
                  onClick={handlePasswordSuccessPopupClick}
                >
                  {t.BackToLoginButton}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default ProfilePage;
