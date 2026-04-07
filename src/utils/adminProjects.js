const STORAGE_KEY = "robocraft_admin_projects";

export function getAdminProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getAdminProject(id) {
  return getAdminProjects().find((p) => p.id === id) || null;
}

export function saveAdminProject(project) {
  const all = getAdminProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  if (idx >= 0) all[idx] = project;
  else all.push(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteAdminProject(id) {
  const all = getAdminProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getMergedCategories(projectCategories) {
  const adminProjects = getAdminProjects();
  if (!adminProjects.length) return projectCategories;

  const merged = projectCategories.map((cat) => ({
    ...cat,
    subCategories: cat.subCategories.map((sub) => ({
      ...sub,
      projects: [...sub.projects],
    })),
  }));

  for (const ap of adminProjects) {
    const cat = merged.find((c) => c.id === ap.categoryId);
    if (!cat) continue;
    const sub = cat.subCategories.find((s) => s.id === ap.subCategoryId);
    if (!sub) continue;
    if (!sub.projects.find((p) => p.id === ap.id)) {
      sub.projects.push({
        id: ap.id,
        name: ap.name,
        description: ap.description,
        difficulty: ap.difficulty,
        tags: ap.tags,
        platform: ap.platform,
      });
    }
  }
  return merged;
}
