import React from "react";
import { Link } from "react-router";
import ProfileDetails from "../components/user/ProfileDetails";

const Profile = () => {
  return (
    <div className="m-2 max-w-3xl p-5">
      <h1 className="text-2xl font-bold text-[#17324D]">My Profile</h1>

      <div className="mt-6">
        <ProfileDetails />
      </div>

      <Link
        to="/edit-profile"
        className="mt-8 inline-block rounded-md bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Edit Profile
      </Link>
    </div>
  );
};

export default Profile;