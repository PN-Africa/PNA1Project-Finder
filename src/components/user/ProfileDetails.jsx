import React from "react";
import { getProfile, formatDate } from "../../utils/profile";

const Field = ({ label, value }) => (
  <div className="m-2 p-5 first:mt-0">
    <p className="text-sm font-semibold text-[#17324D]">{label}</p>
    <p className="mt-1 text-sm text-slate-500">{value}</p>
  </div>
);

const ProfileDetails = () => {
  const profile = getProfile();

  return (
    <div className="p-5 m-2">
      <Field label="Full Name" value={profile.fullName} />
      <Field label="Email" value={profile.email} />
      <Field label="Professional Role" value={profile.role} />
      <Field label="Registration Date" value={formatDate(profile.registrationDate)} />
    </div>
  );
};

export default ProfileDetails;