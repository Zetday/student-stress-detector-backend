import { useEffect, useState } from "react";

// komponent
import Navbar from "../src/components/Navbar/Navbar";
import Sidebar from "../src/components/Sidebar/Sidebar";
import { getProfile } from "../src/services/userService";

function Layout({ title, name, role = "User", children }) {
  const [profile, setProfile] = useState({
    fullname: name,
    role,
    profileImage: null,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return;
    }

    const loadProfile = async () => {
      const result = await getProfile();

      if (!result.error) {
        setProfile({
          fullname: result.data.fullname || name,
          role: result.data.role || role,

          // sesuaikan dengan response backend
          profileImage:
            result.data.profileImage ||
            result.data.profile_image ||
            null,
        });
      }
    };

    loadProfile();
  }, [name, role]);

  return (
    <div className="theme-page min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        <main className="min-w-0 flex-1 overflow-hidden md:ml-52 px-4 md:px-6 pt-20 pb-6">
          <Navbar
            title={title}
            name={profile.fullname}
            role={profile.role}
            profilePhoto={profile.profileImage}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />

          <section className="p-4 md:p-6 lg:p-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Layout;
