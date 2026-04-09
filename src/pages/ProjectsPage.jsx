import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode,
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";
import { projectCategories } from "../data/projects";
import { getMergedCategories } from "../utils/adminProjects";
import { Link, useSearchParams } from "react-router-dom";

function SubCategoryItem({ sub, accentColor }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-6 border-l border-slate-700/50 pl-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 w-full text-left py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all duration-200 group"
      >
        {open ? (
          <FolderOpen className={`w-4 h-4 ${accentColor} flex-shrink-0`} />
        ) : (
          <Folder className={`w-4 h-4 ${accentColor} flex-shrink-0`} />
        )}
        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
          {sub.name}
        </span>
        <span className="ml-auto text-xs text-gray-600">
          {sub.projects.length} project{sub.projects.length !== 1 ? "s" : ""}
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {open && (
        <div className="ml-6 mt-1 mb-2 border-l border-slate-700/30 pl-4 animate-in slide-in-from-top duration-200">
          <p className="text-xs text-gray-500 px-3 py-1.5 italic">
            {sub.description}
          </p>
          {sub.projects.length === 0 ? (
            <div className="py-4 px-3">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <FileCode className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">No projects yet</p>
                <p className="text-xs text-gray-600">Projects coming soon...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {sub.projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-2 w-full text-left py-2.5 px-3 rounded-lg hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-all duration-200 group"
                >
                  <FileCode className={`w-4 h-4 ${accentColor} flex-shrink-0`} />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
                    {project.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, initialOpen }) {
  const [open, setOpen] = useState(initialOpen || false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (initialOpen && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [initialOpen]);

  return (
    <div
      ref={cardRef}
      className={`relative bg-slate-900/50 backdrop-blur-sm border ${category.borderColor} rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300`}
      style={{
        boxShadow: open
          ? `0 0 32px 0 ${category.glowRgb}, 0 0 0 1px ${category.glowRgb}`
          : `0 0 16px 0 ${category.glowRgb}`,
      }}
    >
      {/* Gradient top bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${category.gradientBar}`} />

      {/* Category Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-4 w-full text-left px-5 py-4 hover:bg-white/5 transition-all duration-200 group"
      >
        <span className="text-3xl">{category.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-white">
            {category.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{category.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:block">
            {category.subCategories.length} boards
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              open ? "bg-white/10" : "bg-white/5"
            }`}
          >
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                open ? "rotate-90" : "rotate-0"
              }`}
            />
          </div>
        </div>
      </button>

      {/* Sub-categories — smooth height animation via max-height */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-1">
          <div className="h-px bg-slate-800 mb-3" />
          {category.subCategories.map((sub) => (
            <SubCategoryItem
              key={sub.id}
              sub={sub}
              accentColor={category.accentColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [subscribeState, setSubscribeState] = useState("idle");
  const [searchParams] = useSearchParams();
  const expandId = searchParams.get("expand");
  const mergedCategories = getMergedCategories(projectCategories);
  const totalPlatforms = mergedCategories.length;
  const totalBoards = mergedCategories.reduce(
    (count, category) => count + category.subCategories.length,
    0,
  );
  const totalProjects = mergedCategories.reduce(
    (count, category) =>
      count +
      category.subCategories.reduce(
        (subCount, subCategory) => subCount + subCategory.projects.length,
        0,
      ),
    0,
  );

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeState("submitting");

    try {
      const formData = new FormData(e.currentTarget);
      await fetch(
        "https://ab76e2eb.sibforms.com/serve/MUIFABHYsRs9I4xAk4AkXGCucrb0jrmvZABHwnCevZHYtN9px2gvwjdQm79JdNLB2bqtepMkTnZPOH51Gy64QygvCEzI6Nd_K69af1HzANFGS18dSM2ij1c8rgtUfkBAbjAr2CvmO84l7XM9Sj26VTjcZZDgAHN5T0NFX8-5A6Umnb2QnBJHXB7VbtodhCCdj_ifq_NMP99mq6zIog==",
        {
          method: "POST",
          mode: "no-cors",
          body: formData,
        },
      );

      e.currentTarget.reset();
      setSubscribeState("success");
    } catch {
      setSubscribeState("error");
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-white pt-20 px-4 sm:px-6 lg:px-8 pb-16 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background mouse glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(249, 115, 22, 0.1), transparent 40%)`,
        }}
      />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="mb-10 animate-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center space-x-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
            <span className="text-xs text-orange-300">Project Explorer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
              All Projects
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
            Browse projects by platform. Click a folder to expand it and explore
            the sub-categories and individual builds.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-10 animate-in slide-in-from-bottom duration-700 delay-100">
          {[
            { label: "Platforms", value: totalPlatforms },
            { label: "Board Types", value: totalBoards },
            { label: "Projects", value: totalProjects },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center"
            >
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Category Cards */}
        <div className="space-y-4 animate-in slide-in-from-bottom duration-700 delay-200">
          {mergedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              initialOpen={expandId === category.id}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 mb-4 animate-in slide-in-from-bottom duration-700">
              <Mail className="w-3.5 h-3.5 text-orange-300" />
              <span className="text-xs text-orange-200">Newsletter</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 animate-in slide-in-from-bottom duration-700 delay-100">
              Get project updates in your inbox
            </h3>
            <p className="text-gray-400 text-sm mb-6 animate-in slide-in-from-bottom duration-700 delay-150">
              Subscribe for new project drops, tutorials, and release updates.
            </p>

            <form
              id="sib-form"
              onSubmit={handleSubscribe}
              method="POST"
              data-type="subscription"
              action="https://ab76e2eb.sibforms.com/serve/MUIFABHYsRs9I4xAk4AkXGCucrb0jrmvZABHwnCevZHYtN9px2gvwjdQm79JdNLB2bqtepMkTnZPOH51Gy64QygvCEzI6Nd_K69af1HzANFGS18dSM2ij1c8rgtUfkBAbjAr2CvmO84l7XM9Sj26VTjcZZDgAHN5T0NFX8-5A6Umnb2QnBJHXB7VbtodhCCdj_ifq_NMP99mq6zIog=="
              className="max-w-xl mx-auto animate-in slide-in-from-bottom duration-700 delay-200"
            >
              <div className="group flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-orange-300 transition-colors duration-300" />
                  <input
                    type="email"
                    id="EMAIL"
                    name="EMAIL"
                    required
                    data-required="true"
                    autoComplete="off"
                    placeholder="Enter your email address"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-700 bg-slate-950/80 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribeState === "submitting"}
                  className="h-11 px-6 rounded-xl bg-gradient-to-b from-orange-500 to-orange-400 text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all duration-300"
                >
                  {subscribeState === "submitting" ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-left sm:text-center">
                We respect your inbox. You can unsubscribe anytime.
              </p>
              {subscribeState === "success" && (
                <p className="text-xs text-green-400 mt-2 text-left sm:text-center">
                  Subscription successful. Please check your inbox.
                </p>
              )}
              {subscribeState === "error" && (
                <p className="text-xs text-red-400 mt-2 text-left sm:text-center">
                  Could not subscribe right now. Please try again.
                </p>
              )}

              {/* Brevo-required hidden fields */}
              <input
                type="text"
                name="email_address_check"
                defaultValue=""
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />
              <input type="hidden" name="locale" value="en" />
            </form>

            <div className="mt-5">
              <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-white/10">
                Submit Your Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
