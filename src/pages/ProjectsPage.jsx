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
  const [isSubscribing, setIsSubscribing] = useState(false);
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

  useEffect(() => {
    window.REQUIRED_CODE_ERROR_MESSAGE = "Please choose a country code";
    window.LOCALE = "en";
    window.EMAIL_INVALID_MESSAGE = window.SMS_INVALID_MESSAGE =
      "The information provided is invalid. Please review the field format and try again.";
    window.REQUIRED_ERROR_MESSAGE = "This field cannot be left blank. ";
    window.GENERIC_INVALID_MESSAGE =
      "The information provided is invalid. Please review the field format and try again.";
    window.translation = {
      common: {
        selectedList: "{quantity} list selected",
        selectedLists: "{quantity} lists selected",
        selectedOption: "{quantity} selected",
        selectedOptions: "{quantity} selected",
      },
    };
    window.AUTOHIDE = Boolean(0);
    window.invisibleCaptchaCallback = function invisibleCaptchaCallback() {
      const event = new Event("captchaChange");
      document.getElementById("sib-captcha")?.dispatchEvent(event);
    };
    window.executeCaptcha = function executeCaptcha() {
      if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
        window.grecaptcha.execute();
      }
    };

    if (!document.getElementById("brevo-form-stylesheet")) {
      const styleSheet = document.createElement("link");
      styleSheet.id = "brevo-form-stylesheet";
      styleSheet.rel = "stylesheet";
      styleSheet.href = "https://sibforms.com/forms/end-form/build/sib-styles.css";
      document.head.appendChild(styleSheet);
    }

    if (!document.getElementById("brevo-theme-overrides")) {
      const styleTag = document.createElement("style");
      styleTag.id = "brevo-theme-overrides";
      styleTag.textContent = `
        @font-face {
          font-display: block;
          font-family: Roboto;
          src: url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/7529907e9eaf8ebb5220c5f9850e3811.woff2) format("woff2"),
               url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/25c678feafdc175a70922a116c9be3e7.woff) format("woff");
        }

        #sib-container input::placeholder,
        #sib-container textarea::placeholder {
          color: rgb(148 163 184);
          opacity: 1;
        }

        #sib-form-container #sib-container {
          background: rgba(2, 6, 23, 0.78) !important;
          border: 1px solid rgba(51, 65, 85, 0.85) !important;
          box-shadow: 0 0 40px rgba(15, 23, 42, 0.35) !important;
          overflow: hidden !important;
        }

        #sib-form-container #sib-container p,
        #sib-form-container #sib-container label {
          color: rgb(226 232 240) !important;
        }

        #sib-form-container #sib-container a {
          color: rgb(253 186 116) !important;
        }

        #sib-form-container #sib-container .entry__label {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
        }

        #sib-form-container #sib-container input {
          background: rgba(15, 23, 42, 0.9) !important;
          border: 1px solid rgb(51 65 85) !important;
          color: rgb(248 250 252) !important;
          padding-left: 1rem !important;
          height: 2.75rem !important;
          border-radius: 0.75rem !important;
          box-shadow: none !important;
        }

        #sib-form-container #sib-container input:focus {
          border-color: rgba(249, 115, 22, 0.6) !important;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25) !important;
        }

        #sib-form-container #sib-container .entry__field:before,
        #sib-form-container #sib-container .entry__field:after {
          display: none !important;
        }

        #sib-form-container .entry__specification {
          margin-top: 0.625rem;
        }

        #sib-form-container .sib-form-block {
          margin-bottom: 0;
        }

        #sib-form-container .sib-form-block__button {
          background: linear-gradient(to bottom, rgb(249 115 22), rgb(251 146 60)) !important;
          color: rgb(2 6 23) !important;
          border: 0 !important;
          font-weight: 700 !important;
          border-radius: 0.75rem !important;
          min-width: 10rem !important;
          display: inline-flex !important;
          justify-content: center !important;
          align-items: center !important;
          position: relative !important;
          overflow: hidden !important;
        }

        #sib-form-container .sib-form-block__button:hover {
          filter: brightness(1.05);
        }

        #sib-form-container #sib-captcha {
          width: fit-content;
          max-width: 100%;
        }

        #sib-form-container .grecaptcha-badge {
          max-width: 100% !important;
          box-shadow: none !important;
        }

        #sib-form-container .entry__error {
          color: rgb(252 165 165);
          margin-top: 0.5rem;
        }

        #sib-form-container .sib-form-message-panel {
          display: none;
        }

        #sib-form-container #success-message,
        #sib-form-container #error-message {
          animation: fadeIn 250ms ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(styleTag);
    }

    if (!document.getElementById("brevo-main-script")) {
      const script = document.createElement("script");
      script.id = "brevo-main-script";
      script.defer = true;
      script.src = "https://sibforms.com/forms/end-form/build/main.js";
      document.body.appendChild(script);
    }

    if (!document.getElementById("google-recaptcha-script")) {
      const script = document.createElement("script");
      script.id = "google-recaptcha-script";
      script.async = true;
      script.defer = true;
      script.src = "https://www.google.com/recaptcha/api.js?hl=en";
      document.body.appendChild(script);
    }
  }, []);

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
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 mb-3 animate-in slide-in-from-bottom duration-700">
              <Mail className="w-3.5 h-3.5 text-orange-300" />
              <span className="text-xs text-orange-200">Newsletter</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 animate-in slide-in-from-bottom duration-700 delay-100">
              Get project updates in your inbox
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 animate-in slide-in-from-bottom duration-700 delay-150">
              Subscribe for new project drops, tutorials, and release updates.
            </p>

            <div className="sib-form max-w-2xl mx-auto animate-in slide-in-from-bottom duration-700 delay-200 text-left">
              <div id="sib-form-container" className="sib-form-container">
                <div
                  id="error-message"
                  className="sib-form-message-panel rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-4 text-left"
                >
                  <div className="sib-form-message-panel__text">
                    Your subscription could not be saved. Please try again.
                  </div>
                </div>
                <div
                  id="success-message"
                  className="sib-form-message-panel rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-3 text-sm text-green-200 mb-4 text-left"
                >
                  <div className="sib-form-message-panel__text">
                    Your subscription has been successful.
                  </div>
                </div>

                <div
                  id="sib-container"
                  className="sib-container--large sib-container--vertical rounded-2xl border border-slate-700/80 bg-slate-950/70 p-4 sm:p-5 shadow-[0_0_40px_rgba(15,23,42,0.35)] backdrop-blur"
                  style={{ direction: "ltr" }}
                >
                  <form
                    id="sib-form"
                    method="POST"
                    data-type="subscription"
                    action="https://ab76e2eb.sibforms.com/serve/MUIFABHYsRs9I4xAk4AkXGCucrb0jrmvZABHwnCevZHYtN9px2gvwjdQm79JdNLB2bqtepMkTnZPOH51Gy64QygvCEzI6Nd_K69af1HzANFGS18dSM2ij1c8rgtUfkBAbjAr2CvmO84l7XM9Sj26VTjcZZDgAHN5T0NFX8-5A6Umnb2QnBJHXB7VbtodhCCdj_ifq_NMP99mq6zIog=="
                    onSubmit={() => setIsSubscribing(true)}
                  >
                    <div className="space-y-1.5 pb-3 sm:pb-4">
                      <p className="text-lg sm:text-xl font-bold text-orange-400 leading-tight">
                        Newsletter
                      </p>
                      <p className="text-sm text-slate-300">
                        Subscribe to our newsletter and stay updated.
                      </p>
                    </div>

                    <div className="pb-1.5 sm:pb-2.5">
                      <div className="sib-input sib-form-block">
                        <div className="form__entry entry_block">
                          <div className="form__label-row">
                            <label
                              className="entry__label mb-2 block text-sm font-semibold text-slate-100"
                              htmlFor="EMAIL"
                              data-required="*"
                            >
                              Enter your email address to subscribe
                            </label>

                            <div className="entry__field relative">
                              <input
                                className="input w-full pr-4 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all duration-300"
                                type="text"
                                id="EMAIL"
                                name="EMAIL"
                                autoComplete="off"
                                placeholder="EMAIL"
                                data-required="true"
                                required
                              />
                            </div>
                          </div>

                          <label className="entry__error entry__error--primary text-sm text-red-300" />
                          <label className="entry__specification mt-1.5 block text-xs text-slate-400">
                            Provide your email address to subscribe. For e.g abc@xyz.com
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 pb-2.5 sm:pb-3.5 border-t border-slate-800/70 mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                        <div
                          className="g-recaptcha"
                          id="sib-captcha"
                          data-sitekey="6LemQq4sAAAAAGzpUm304Gh3UGPcTwKk3_1X0Vmz"
                          data-callback="invisibleCaptchaCallback"
                          data-size="invisible"
                          data-badge="inline"
                          onClick={() => window.executeCaptcha?.()}
                        />

                        <button
                          className="sib-form-block__button sib-form-block__button-with-loader h-11 w-full sm:w-auto px-6 rounded-xl bg-gradient-to-b from-orange-500 to-orange-400 text-slate-950 font-bold text-sm hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all duration-300"
                          form="sib-form"
                          type="submit"
                        >
                          {isSubscribing ? "Subscribing..." : "Subscribe"}
                        </button>
                      </div>
                    </div>

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
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
              <button className="w-full sm:w-auto px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-white/10">
                Submit Your Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
