import React from "react";
import { Link } from "react-router";
import ProfileDetails from "../components/user/ProfileDetails";

const EditedProfile = () => {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-[#17324D]">My Profile</h1>

      <p
        role="status"
        className="mt-4 rounded-md bg-[#D9F5E3] px-4 py-2 text-sm text-[#15803D]"
      >
        Profile has been updated successfully
      </p>

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

export default EditedProfile;