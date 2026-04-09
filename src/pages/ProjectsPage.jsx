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

        @font-face {
          font-display: fallback;
          font-family: Roboto;
          font-weight: 600;
          src: url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/6e9caeeafb1f3491be3e32744bc30440.woff2) format("woff2"),
               url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/71501f0d8d5aa95960f6475d5487d4c2.woff) format("woff");
        }

        @font-face {
          font-display: fallback;
          font-family: Roboto;
          font-weight: 700;
          src: url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/3ef7cf158f310cf752d5ad08cd0e7e60.woff2) format("woff2"),
               url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/ece3a1d82f18b60bcce0211725c476aa.woff) format("woff");
        }

        #sib-container input:-ms-input-placeholder {
          text-align: left;
          font-family: Helvetica, sans-serif;
          color: #c0ccda;
        }

        #sib-container input::placeholder {
          text-align: left;
          font-family: Helvetica, sans-serif;
          color: #c0ccda;
        }

        #sib-container textarea::placeholder {
          text-align: left;
          font-family: Helvetica, sans-serif;
          color: #c0ccda;
        }

        #sib-container a {
          text-decoration: underline;
          color: #2BB2FC;
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

            <div className="sib-form max-w-xl mx-auto animate-in slide-in-from-bottom duration-700 delay-200 text-left">
              <div id="sib-form-container" className="sib-form-container">
                <div
                  id="error-message"
                  className="sib-form-message-panel"
                  style={{
                    fontSize: "16px",
                    textAlign: "left",
                    fontFamily: "Helvetica, sans-serif",
                    color: "#661d1d",
                    backgroundColor: "#ffeded",
                    borderRadius: "3px",
                    borderColor: "#ff4949",
                    maxWidth: "540px",
                  }}
                >
                  <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                    Your subscription could not be saved. Please try again.
                  </div>
                </div>
                <div id="success-message" className="sib-form-message-panel" style={{
                  fontSize: "16px",
                  textAlign: "left",
                  fontFamily: "Helvetica, sans-serif",
                  color: "#085229",
                  backgroundColor: "#e7faf0",
                  borderRadius: "3px",
                  borderColor: "#13ce66",
                  maxWidth: "540px",
                }}>
                  <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                    Your subscription has been successful.
                  </div>
                </div>

                <div
                  id="sib-container"
                  className="sib-container--large sib-container--vertical"
                  style={{
                    textAlign: "center",
                    backgroundColor: "rgba(168,166,166,1)",
                    maxWidth: "540px",
                    borderRadius: "3px",
                    borderWidth: "1px",
                    borderColor: "#C0CCD9",
                    borderStyle: "solid",
                    direction: "ltr",
                  }}
                >
                  <form
                    id="sib-form"
                    method="POST"
                    data-type="subscription"
                    action="https://ab76e2eb.sibforms.com/serve/MUIFABHYsRs9I4xAk4AkXGCucrb0jrmvZABHwnCevZHYtN9px2gvwjdQm79JdNLB2bqtepMkTnZPOH51Gy64QygvCEzI6Nd_K69af1HzANFGS18dSM2ij1c8rgtUfkBAbjAr2CvmO84l7XM9Sj26VTjcZZDgAHN5T0NFX8-5A6Umnb2QnBJHXB7VbtodhCCdj_ifq_NMP99mq6zIog=="
                  >
                    <div style={{ padding: "16px 0" }}>
                      <div className="sib-form-block" style={{ fontSize: "32px", textAlign: "left", fontWeight: 700, fontFamily: '"Comic Sans MS", sans-serif', color: "#fa7b03", backgroundColor: "transparent" }}>
                        <p>Newsletter</p>
                      </div>
                    </div>

                    <div style={{ padding: "16px 0" }}>
                      <div className="sib-form-block" style={{ fontSize: "16px", textAlign: "left", fontFamily: "Helvetica, sans-serif", color: "#050505", backgroundColor: "transparent" }}>
                        <div className="sib-text-form-block">
                          <p>Subscribe to our newsletter and stay updated.</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "16px 0" }}>
                      <div className="sib-input sib-form-block">
                        <div className="form__entry entry_block">
                          <div className="form__label-row">
                            <label className="entry__label" style={{ fontWeight: 700, textAlign: "left", fontSize: "16px", fontFamily: "Helvetica, sans-serif", color: "#3c4858" }} htmlFor="EMAIL" data-required="*">
                              Enter your email address to subscribe
                            </label>

                            <div className="entry__field">
                              <input
                                className="input"
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

                          <label className="entry__error entry__error--primary" style={{ fontSize: "16px", textAlign: "left", fontFamily: "Helvetica, sans-serif", color: "#661d1d", backgroundColor: "#ffeded", borderRadius: "3px", borderColor: "#ff4949" }} />
                          <label className="entry__specification" style={{ fontSize: "12px", textAlign: "left", fontFamily: "Helvetica, sans-serif", color: "#8390A4" }}>
                            Provide your email address to subscribe. For e.g abc@xyz.com
                          </label>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "16px 0" }}>
                      <div
                        className="g-recaptcha"
                        id="sib-captcha"
                        data-sitekey="6LemQq4sAAAAAGzpUm304Gh3UGPcTwKk3_1X0Vmz"
                        data-callback="invisibleCaptchaCallback"
                        data-size="invisible"
                        onClick={() => window.executeCaptcha?.()}
                      />
                    </div>

                    <div style={{ padding: "16px 0" }}>
                      <div className="sib-form-block" style={{ textAlign: "left" }}>
                        <button
                          className="sib-form-block__button sib-form-block__button-with-loader"
                          style={{ fontSize: "16px", textAlign: "left", fontWeight: 700, fontFamily: '"Trebuchet MS", sans-serif', color: "#171515", backgroundColor: "#06e70e", borderRadius: "3px", borderWidth: "0px" }}
                          form="sib-form"
                          type="submit"
                        >
                          <svg
                            className="icon clickable__icon progress-indicator__icon sib-hide-loader-icon"
                            viewBox="0 0 512 512"
                          >
                            <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
                          </svg>
                          SUBSCRIBE
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: "16px 0" }}>
                      <div className="sib-form__declaration" style={{ direction: "ltr" }}>
                        <div style={{ fontSize: "14px", textAlign: "left", fontFamily: "Helvetica, sans-serif", color: "#ffffff", backgroundColor: "transparent" }}>
                          <p>
                            We use Brevo as our marketing platform. By submitting this form you agree that the personal data you provided will be transferred to Brevo for processing in accordance with{" "}
                            <a href="https://www.brevo.com/en/legal/privacypolicy/" target="_blank" rel="noreferrer">
                              Brevo&apos;s Privacy Policy.
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <input
                      type="text"
                      name="email_address_check"
                      defaultValue=""
                      className="input--hidden"
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
