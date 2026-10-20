import { useState } from "react";
import ProjectCard from "../components/user/ProjectCard";
import { projectData } from "../data";

const ProjectLibary = () => {
  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 3;

  const filteredProjects = projectData.filter((p) => {
    const matchIndustry = industry === "" || p.industry === industry;
    const matchDifficulty = difficulty === "" || p.difficulty === difficulty;
    return matchIndustry && matchDifficulty;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemPerPage);
  const startIndex = (currentPage - 1) * itemPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemPerPage);

  
const selectStyle =
  "rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] focus:border-[#2563EB] focus:outline-none";

const pageBtn =
  "rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm text-[#475569] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div>
        <h1 className="m-2 p-4 text-2xl font-bold text-[#17324D]">Explore Project</h1>
        <p className="p-5 text-black text-[18px] font-semi-bold">Filter By</p>

        <div className="flex flex-wrap gap-3 p-5 m-2">
          <select
            className={selectStyle}
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="FinTech">FinTech</option>
            <option value="E-commerce">E-Commerce</option>
            <option value="Real Estate">Real Estate</option>
            <option value="EdTech">EdTech</option>
          </select>

          <select
            className={selectStyle}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      

      <h3 className="p-4 text-black font-bold">Available Projects</h3>

      {currentProjects.length === 0 ? (
        <p className="p-4 text-black ">No projects match your filters.</p>
      ) : (
        currentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} className="p-4" />
        ))
      )}

     {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-4 ">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={pageBtn}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-[#2563EB] text-white"
                  : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectLibary;