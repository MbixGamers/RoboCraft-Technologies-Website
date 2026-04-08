import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut, Plus, Trash2, ChevronDown, ChevronRight, Save,
  Eye, FileCode, CircuitBoard, List, Package, Cpu, Upload,
  CheckCircle, Pencil, ShieldCheck
} from "lucide-react";
import { projectCategories } from "../data/projects";
import { saveAdminProject, getAdminProjects, deleteAdminProject, slugify } from "../utils/adminProjects";

const LANGS = [
  { value: "cpp",        label: "C++ / Arduino (.ino)" },
  { value: "javascript", label: "JavaScript (.js / .gs)" },
  { value: "python",     label: "Python (.py)" },
  { value: "bash",       label: "Shell / Bash" },
];

let _uidCounter = 1;
const uid = () => `row-${Date.now()}-${_uidCounter++}`;

const emptyForm = () => ({
  name:           "",
  description:    "",
  difficulty:     "Beginner",
  tagsRaw:        "",
  categoryId:     "esp",
  subCategoryId:  "esp8266",
  platform:       "",
  whatYoullBuild: [""],
  howItWorks:     [
    { _id: uid(), n: "1", label: "", desc: "" },
    { _id: uid(), n: "2", label: "", desc: "" },
    { _id: uid(), n: "3", label: "", desc: "" },
    { _id: uid(), n: "4", label: "", desc: "" },
  ],
  schematicImage: "",
  wiringConnections: [{ _id: uid(), from: "", to: "" }],
  steps:    [{ _id: uid(), title: "", detail: "" }],
  materials:[{ _id: uid(), name: "", qty: "" }],
  codeFiles:[{ _id: uid(), id: "main", label: "sketch.ino", lang: "cpp", hint: "C++ / Arduino", code: "" }],
});

function SectionHeader({ icon: Icon, label, open, onToggle, accent = "text-orange-400" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
    >
      <Icon className={`w-4 h-4 ${accent}`} />
      <span className="font-semibold text-white text-sm flex-1 text-left">{label}</span>
      {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
    </button>
  );
}

function fieldClass(extra = "") {
  return `w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all ${extra}`;
}

function labelClass() {
  return "block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [form, setForm]         = useState(emptyForm());
  const [sections, setSections] = useState({ basics: true, overview: false, schematic: false, steps: false, materials: false, code: false });
  const [saved, setSaved]       = useState(null);
  const [existing, setExisting] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("rc_admin") !== "1") {
      navigate("/admin");
    }
    setExisting(getAdminProjects());
  }, [navigate]);

  const toggleSection = (key) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const getSubCats = () =>
    projectCategories.find((c) => c.id === form.categoryId)?.subCategories || [];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateField("schematicImage", reader.result);
    reader.readAsDataURL(file);
  };

  const addRow = (key, template) =>
    setForm((f) => ({ ...f, [key]: [...f[key], template] }));

  const removeRow = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const updateRow = (key, idx, field, value) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [key]: arr };
    });

  const updateSimpleRow = (key, idx, value) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr[idx] = value;
      return { ...f, [key]: arr };
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { alert("Project name is required."); return; }

    const stripId = ({ _id, ...rest }) => rest;

    const id = editingId || slugify(form.name);
    const project = {
      id,
      name:          form.name.trim(),
      description:   form.description.trim(),
      difficulty:    form.difficulty,
      tags:          form.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      categoryId:    form.categoryId,
      subCategoryId: form.subCategoryId,
      platform:      form.platform.trim() || projectCategories
                       .find((c) => c.id === form.categoryId)
                       ?.subCategories.find((s) => s.id === form.subCategoryId)?.name || "",
      whatYoullBuild:    form.whatYoullBuild.filter(Boolean),
      howItWorks:        form.howItWorks.map(stripId),
      schematicImage:    form.schematicImage,
      wiringConnections: form.wiringConnections.filter((r) => r.from || r.to).map(stripId),
      steps:   form.steps.filter((s) => s.title).map((s, i) => ({ ...stripId(s), step: i + 1 })),
      materials: form.materials.filter((m) => m.name.trim()).map(stripId),
      codeFiles: form.codeFiles.filter((f) => f.code.trim()).map(stripId),
    };

    saveAdminProject(project);
    setExisting(getAdminProjects());
    setSaved(id);
    setEditingId(null);
    setForm(emptyForm());
    setSections({ basics: true, overview: false, schematic: false, steps: false, materials: false, code: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({
      name:           project.name,
      description:    project.description,
      difficulty:     project.difficulty,
      tagsRaw:        (project.tags || []).join(", "),
      categoryId:     project.categoryId,
      subCategoryId:  project.subCategoryId,
      platform:       project.platform,
      whatYoullBuild: project.whatYoullBuild?.length ? project.whatYoullBuild : [""],
      howItWorks:     project.howItWorks?.length
        ? project.howItWorks.map((r) => ({ _id: uid(), ...r }))
        : emptyForm().howItWorks,
      schematicImage: project.schematicImage || "",
      wiringConnections: project.wiringConnections?.length
        ? project.wiringConnections.map((r) => ({ _id: uid(), ...r }))
        : [{ _id: uid(), from: "", to: "" }],
      steps: project.steps?.length
        ? project.steps.map((s) => ({ _id: uid(), title: s.title, detail: s.detail }))
        : [{ _id: uid(), title: "", detail: "" }],
      materials: project.materials?.length
        ? project.materials.map((m) => ({ _id: uid(), ...m }))
        : [{ _id: uid(), name: "", qty: "" }],
      codeFiles: project.codeFiles?.length
        ? project.codeFiles.map((f) => ({ _id: uid(), ...f }))
        : [{ _id: uid(), id: "main", label: "sketch.ino", lang: "cpp", hint: "C++ / Arduino", code: "" }],
    });
    setSections({ basics: true, overview: true, schematic: true, steps: true, materials: true, code: true });
    setSaved(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    deleteAdminProject(id);
    setExisting(getAdminProjects());
    if (saved === id) setSaved(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("rc_admin");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-orange-400" />
          <span className="font-bold text-white text-sm">Admin Dashboard</span>
          <span className="text-gray-600 text-xs">· RoboCraft Technologies</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Success banner */}
        {saved && (
          <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300 font-medium">Project saved successfully!</span>
            </div>
            <Link
              to={`/projects/${saved}`}
              className="text-xs text-green-400 hover:text-green-300 underline"
            >
              View project →
            </Link>
          </div>
        )}

        {/* Existing projects */}
        {existing.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="font-bold text-white text-sm">Your Projects ({existing.length})</h2>
            </div>
            <div className="divide-y divide-slate-800/50">
              {existing.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.platform} · {p.difficulty}</p>
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white">
              {editingId ? "Edit Project" : "Add New Project"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm(emptyForm()); setSaved(null); }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel edit
              </button>
            )}
          </div>

          {/* ── BASICS ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <SectionHeader icon={Cpu} label="1. Basic Info" open={sections.basics} onToggle={() => toggleSection("basics")} />
            {sections.basics && (
              <div className="px-5 pb-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass()}>Project Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. RFID Attendance with Google Sheets"
                      required
                      className={fieldClass()}
                    />
                    {form.name && (
                      <p className="text-xs text-gray-600 mt-1 font-mono">ID: {slugify(form.name)}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass()}>Difficulty</label>
                    <select value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)} className={fieldClass()}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass()}>About This Project / Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    placeholder="What does this project do? Summarise it in 2–3 sentences."
                    className={fieldClass("resize-none")}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass()}>Category</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => {
                        const cat = projectCategories.find((c) => c.id === e.target.value);
                        updateField("categoryId", e.target.value);
                        updateField("subCategoryId", cat?.subCategories[0]?.id || "");
                      }}
                      className={fieldClass()}
                    >
                      {projectCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass()}>Board / Sub-Category</label>
                    <select
                      value={form.subCategoryId}
                      onChange={(e) => {
                        updateField("subCategoryId", e.target.value);
                        const sub = getSubCats().find((s) => s.id === e.target.value);
                        updateField("platform", sub?.name || "");
                      }}
                      className={fieldClass()}
                    >
                      {getSubCats().map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass()}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tagsRaw}
                    onChange={(e) => updateField("tagsRaw", e.target.value)}
                    placeholder="e.g. RFID, WiFi, IoT, Google Sheets"
                    className={fieldClass()}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── OVERVIEW ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <SectionHeader icon={FileCode} label="2. Overview" open={sections.overview} onToggle={() => toggleSection("overview")} />
            {sections.overview && (
              <div className="px-5 pb-6 space-y-6">
                <div>
                  <label className={labelClass()}>What You'll Build (bullet points)</label>
                  <div className="space-y-2">
                    {form.whatYoullBuild.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-orange-400 mt-2.5 text-sm">▸</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateSimpleRow("whatYoullBuild", i, e.target.value)}
                          placeholder={`Feature ${i + 1}…`}
                          className={fieldClass("flex-1")}
                        />
                        {form.whatYoullBuild.length > 1 && (
                          <button type="button" onClick={() => removeRow("whatYoullBuild", i)} className="text-gray-600 hover:text-red-400 transition-colors mt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRow("whatYoullBuild", "")}
                      className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add point
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass()}>How It Works (4 steps)</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {form.howItWorks.map((item, i) => (
                      <div key={item._id} className="bg-slate-800/40 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateRow("howItWorks", i, "label", e.target.value)}
                            placeholder={`Step ${i + 1} label (e.g. "Tap Card")`}
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none border-b border-slate-700 pb-0.5 focus:border-orange-500/60 transition-colors"
                          />
                        </div>
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => updateRow("howItWorks", i, "desc", e.target.value)}
                          placeholder="Short description…"
                          className={fieldClass("text-xs")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SCHEMATIC ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <SectionHeader icon={CircuitBoard} label="3. Schematic & Wiring" open={sections.schematic} onToggle={() => toggleSection("schematic")} accent="text-green-400" />
            {sections.schematic && (
              <div className="px-5 pb-6 space-y-5">
                <div>
                  <label className={labelClass()}>Circuit Diagram Image</label>
                  <label className="flex flex-col items-center justify-center gap-3 w-full h-36 border-2 border-dashed border-slate-700 rounded-xl hover:border-orange-500/40 cursor-pointer transition-colors bg-slate-800/30">
                    {form.schematicImage ? (
                      <img src={form.schematicImage} alt="preview" className="max-h-28 rounded-lg object-contain" />
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-gray-500" />
                        <span className="text-xs text-gray-500">Click to upload circuit diagram (PNG/JPG)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {form.schematicImage && (
                    <button type="button" onClick={() => updateField("schematicImage", "")} className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">
                      Remove image
                    </button>
                  )}
                </div>

                <div>
                  <label className={labelClass()}>Wiring Connections</label>
                  <div className="space-y-2">
                    {form.wiringConnections.map((row, i) => (
                      <div key={row._id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={row.from}
                          onChange={(e) => updateRow("wiringConnections", i, "from", e.target.value)}
                          placeholder="From (e.g. RC522 SDA)"
                          className={fieldClass("flex-1")}
                        />
                        <span className="text-gray-600 text-sm flex-shrink-0">→</span>
                        <input
                          type="text"
                          value={row.to}
                          onChange={(e) => updateRow("wiringConnections", i, "to", e.target.value)}
                          placeholder="To (e.g. NodeMCU D4)"
                          className={fieldClass("flex-1")}
                        />
                        {form.wiringConnections.length > 1 && (
                          <button type="button" onClick={() => removeRow("wiringConnections", i)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRow("wiringConnections", { _id: uid(), from: "", to: "" })}
                      className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add connection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── STEPS ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <SectionHeader icon={List} label="4. Steps & Procedure" open={sections.steps} onToggle={() => toggleSection("steps")} />
            {sections.steps && (
              <div className="px-5 pb-6 space-y-3">
                {form.steps.map((step, i) => (
                  <div key={step._id} className="bg-slate-800/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400">Step {i + 1}</span>
                      {form.steps.length > 1 && (
                        <button type="button" onClick={() => removeRow("steps", i)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateRow("steps", i, "title", e.target.value)}
                      placeholder="Step title…"
                      className={fieldClass()}
                    />
                    <textarea
                      value={step.detail}
                      onChange={(e) => updateRow("steps", i, "detail", e.target.value)}
                      rows={2}
                      placeholder="Detailed instructions for this step…"
                      className={fieldClass("resize-none")}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addRow("steps", { _id: uid(), title: "", detail: "" })}
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add step
                </button>
              </div>
            )}
          </div>

          {/* ── MATERIALS ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <SectionHeader icon={Package} label="5. Materials Required" open={sections.materials} onToggle={() => toggleSection("materials")} accent="text-blue-400" />
            {sections.materials && (
              <div className="px-5 pb-6 space-y-2">
                {form.materials.map((m, i) => (
                  <div key={m._id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateRow("materials", i, "name", e.target.value)}
                      placeholder="Component name (e.g. NodeMCU ESP8266)"
                      className={fieldClass("flex-1")}
                    />
                    <input
                      type="text"
                      value={m.qty}
                      onChange={(e) => updateRow("materials", i, "qty", e.target.value)}
                      placeholder="Qty (e.g. ×1)"
                      className={fieldClass("w-24")}
                    />
                    {form.materials.length > 1 && (
                      <button type="button" onClick={() => removeRow("materials", i)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addRow("materials", { _id: uid(), name: "", qty: "" })}
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add component
                </button>
              </div>
            )}
          </div>

          {/* ── CODE ── */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <SectionHeader icon={FileCode} label="6. Code Files" open={sections.code} onToggle={() => toggleSection("code")} accent="text-purple-400" />
            {sections.code && (
              <div className="px-5 pb-6 space-y-4">
                {form.codeFiles.map((f, i) => (
                  <div key={f._id} className="bg-slate-800/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">File {i + 1}</span>
                      {form.codeFiles.length > 1 && (
                        <button type="button" onClick={() => removeRow("codeFiles", i)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Filename</label>
                        <input
                          type="text"
                          value={f.label}
                          onChange={(e) => updateRow("codeFiles", i, "label", e.target.value)}
                          placeholder="e.g. main_sketch.ino"
                          className={fieldClass()}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Language</label>
                        <select
                          value={f.lang}
                          onChange={(e) => {
                            const l = LANGS.find((x) => x.value === e.target.value);
                            updateRow("codeFiles", i, "lang", e.target.value);
                            updateRow("codeFiles", i, "hint", l?.label || "");
                          }}
                          className={fieldClass()}
                        >
                          {LANGS.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Code</label>
                      <textarea
                        value={f.code}
                        onChange={(e) => updateRow("codeFiles", i, "code", e.target.value)}
                        rows={12}
                        placeholder="Paste your code here…"
                        className="w-full bg-gray-900/60 border border-slate-700 rounded-xl px-4 py-3 text-xs text-green-300 font-mono placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all resize-y"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addRow("codeFiles", {
                      _id: uid(),
                      id: `file-${Date.now()}`,
                      label: "new_file.ino",
                      lang: "cpp",
                      hint: "C++ / Arduino",
                      code: "",
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add code file
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-b from-orange-500 to-orange-600 rounded-2xl font-bold text-base hover:from-orange-400 hover:to-orange-500 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-5 h-5" />
            {editingId ? "Save Changes" : "Publish Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
