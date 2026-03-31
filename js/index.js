const state = {
  experience: [],
  projects: [],
  skills: [],
  highlights: []
};

const getCollection = (payload, key) => {
  if (Array.isArray(payload?.[key])) {
    return payload[key];
  }

  if (Array.isArray(payload?.data?.[key])) {
    return payload.data[key];
  }

  if (Array.isArray(payload?.data?.attributes?.[key])) {
    return payload.data.attributes[key];
  }

  return [];
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const paragraphsToHtml = (paragraphs) => {
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];
  return safeParagraphs.map((line) => escapeHtml(line)).join("<br>");
};

const renderExperience = (experience) => {
  const root = document.getElementById("experience-root");
  if (!root) return;

  root.innerHTML = experience
    .map((company) => {
      const roles = Array.isArray(company.roles) ? company.roles : [];
      return `
        <div>
          <h3 class="subtitle subtitle--3xs c-ash950">${escapeHtml(company.company)}</h3>
          <div class="d-flex fd-column g-1">
            ${roles
          .map(
            (role) => `
                  <div>
                    <div class="d-flex ai-center jc-space-between">
                      <h4 class="subtitle subtitle--3xs c-ash900 fw-500">${escapeHtml(role.title)}</h4>
                      <span class="text text--sm c-ash700">${escapeHtml(role.period)}</span>
                    </div>
                    <p class="text text--sm c-ash600">
                      ${paragraphsToHtml(role.description)}
                    </p>
                  </div>
                `
          )
          .join("")}
          </div>
        </div>
      `;
    })
    .join("");
};

const renderProjects = (projects) => {
  const root = document.getElementById("projects-root");
  if (!root) return;

  root.innerHTML = projects
    .map((project) => {
      const tags = Array.isArray(project.tags) ? project.tags : [];
      return `
        <div class="card">
          <div class="card__content d-flex fd-column g-2">
            <a href="${escapeHtml(project.url || "#")}" target="_blank" rel="noopener noreferrer" class="link interactive interactive--lg c-ash950">
              ${escapeHtml(project.name)}
            </a>
            <p class="text text--xs c-ash600">${escapeHtml(project.description)}</p>
            <div class="mt-auto d-flex fw-wrap g-1">
              ${tags.map((tag) => `<span class="badge text text--2xs">${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

const renderSkills = (skills) => {
  const root = document.getElementById("skills-root");
  if (!root) return;

  root.innerHTML = skills
    .map(
      (skill) => `
        <span class="badge text text--xs d-flex ai-center g-1">
          <img src="${escapeHtml(skill.icon || "")}" alt="${escapeHtml(skill.alt || `Logo de ${skill.name}`)}" loading="lazy" width="16" height="16">
          ${escapeHtml(skill.name)}
        </span>
      `
    )
    .join("");
};

const renderHighlights = (highlights) => {
  const root = document.getElementById("highlights-root");
  if (!root) return;

  root.innerHTML = highlights
    .map((highlight) => {
      const badges = Array.isArray(highlight.badges) ? highlight.badges : [];
      return `
        <article class="card">
          <div class="card__content d-flex fd-column g-2">
            <h3 class="subtitle subtitle--3xs c-ash900">${escapeHtml(highlight.title)}</h3>
            <p class="text text--xs c-ash600">${escapeHtml(highlight.description)}</p>
            <div class="mt-auto d-flex fw-wrap g-1">
              ${badges.map((badge) => `<span class="badge text text--2xs">${escapeHtml(badge)}</span>`).join("")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const render = () => {
  renderExperience(state.experience);
  renderProjects(state.projects);
  renderSkills(state.skills);
  renderHighlights(state.highlights);
};

const showFallback = () => {
  const root = document.getElementById("content-source-note");
  if (root) {
    root.textContent =
      "No se pudo cargar el endpoint remoto del CV. Verifica la disponibilidad del JSON publicado.";
  }
};

const setupPrintButton = () => {
  const button = document.getElementById("download-pdf-btn");
  if (!button) return;

  button.addEventListener("click", () => {
    window.print();
  });
};

const bootstrap = async () => {
  setupPrintButton();

  try {
    const response = await fetch("https://elliotgaramendi.github.io/api/json/cv.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.experience = getCollection(payload, "experience");
    state.projects = getCollection(payload, "projects");
    state.skills = getCollection(payload, "skills");
    state.highlights = getCollection(payload, "highlights");
    render();
  } catch (error) {
    showFallback();
    console.error("Error loading CV data", error);
  }
};

bootstrap();
