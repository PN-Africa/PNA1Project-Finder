import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getSimulations } from "../utils/simulation";

const MySimulations = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSimulations();
        if (!cancelled) setSimulations(data);
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className=" max-w-5xl p-7">
      <h1 className="text-2xl font-bold text-[#17324D]">My Simulations</h1>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading…</p>}

      {!loading && simulations.length === 0 && (
        <div className="mt-8">
          <p className="font-medium text-[#17324D]">No simulations yet</p>
          <p className="mt-1 text-sm text-slate-500">
            You haven't started any simulations. Explore the project library to get started.
          </p>
          <Link
            to="/project-library"
            className="mt-4 inline-block rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Explore Projects
          </Link>
        </div>
      )}

      {!loading && simulations.length > 0 && (
        <div className="mt-6 grid gap-4">
          {simulations.map((sim) => (
            <Link
              key={sim.id}
              to={`/simulation/${sim.id}`}
              className="rounded-lg bg-white p-5 transition hover:shadow-md"
            >
              <h3 className="font-semibold text-[#17324D]">
                {sim.project_title ?? sim.project?.title ?? "Untitled"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {sim.status ?? "In progress"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySimulations;