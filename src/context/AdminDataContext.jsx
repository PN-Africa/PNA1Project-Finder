import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, toList, toCount } from "../utils/api";
import { isAdmin } from "../utils/auth";

const AdminDataContext = createContext(null);


const userIdOf = (s) => s.user?.id ?? s.user ?? s.user_id;
const projectIdOf = (s) => s.project?.id ?? s.project ?? s.project_id;
const isSubmitted = (s) => String(s.status || "").toLowerCase() === "submitted";


export const AdminDataProvider = ({ children }) => {
  const [data, setData] = useState({
    users: [],
    submissions: [],
    projects: [],
    counts: { users: 0, submissions: 0, projects: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    const endpoints = {
      users: "/auth/users/?page_size=100",    
      submissions: "/simulations/?page_size=100",
      projects: "/projects/?page_size=100",
    };
    const keys = Object.keys(endpoints);
    const results = await Promise.allSettled(keys.map((k) => apiFetch(endpoints[k])));

    const next = {
      users: [],
      submissions: [],
      projects: [],
      counts: { users: 0, submissions: 0, projects: 0 },
    };
    const failed = [];

    results.forEach((r, i) => {
      const key = keys[i];
      if (r.status === "rejected") {
        failed.push(`${key} (${r.reason?.message || "request failed"})`);
        return;
      }
      if (key === "users") {
        const all = toList(r.value);
        const people = all.filter((u) => !isAdmin(u));
        next.users = people;
        next.counts.users = people.length;
      } else {
        next[key] = toList(r.value);
        next.counts[key] = toCount(r.value);
      }
    });

    // No users endpoint: build the list from users embedded in submissions
    if (failed.some((f) => f.startsWith("users"))) {
      const seen = new Map();
      next.submissions.forEach((s) => {
        const u = s.user;
        if (u && typeof u === "object" && u.id != null && !isAdmin(u)) seen.set(u.id, u);
      });
      if (seen.size > 0) {
        next.users = [...seen.values()];
        next.counts.users = next.users.length;
      }
    }

    setData(next);
    setError(failed.length ? `Could not load: ${failed.join(", ")}` : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const derived = useMemo(() => {
    const submissionsByUser = {};
    const submissionsByProject = {};
    data.submissions.forEach((s) => {
      const u = userIdOf(s);
      const p = projectIdOf(s);
      if (u != null) submissionsByUser[u] = (submissionsByUser[u] || 0) + 1;
      if (p != null) submissionsByProject[p] = (submissionsByProject[p] || 0) + 1;
    });
    return { submissionsByUser, submissionsByProject };
  }, [data.submissions]);

  const value = { ...data, ...derived, loading, error, reload };
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
};