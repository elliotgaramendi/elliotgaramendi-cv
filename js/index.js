const state = {
  profile: {},
  experience: [],
  education: [],
  projects: [],
  skills: [],
  highlights: []
};

const CV_ENDPOINT = "https://elliotgaramendi.github.io/api/json/cv.json";

const getObject = (payload, key) => {
  if (payload?.[key] && typeof payload[key] === "object" && !Array.isArray(payload[key])) {
    return payload[key];
  }

  if (payload?.data?.[key] && typeof payload.data[key] === "object" && !Array.isArray(payload.data[key])) {
    return payload.data[key];
  }

  if (
    payload?.data?.attributes?.[key] &&
    typeof payload.data.attributes[key] === "object" &&
    !Array.isArray(payload.data.attributes[key])
  ) {
    return payload.data.attributes[key];
  }

  return {};
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
  return safeParagraphs.map((line) => "- " + escapeHtml(line)).join("<br>");
};

const renderActionLinks = (links) => {
  const safeLinks = Array.isArray(links) ? links : [];
  if (safeLinks.length === 0) return "";

  return `
    <div class="d-flex ai-center g-1">
      ${safeLinks
        .map(
          (link) => `
            <a href="${escapeHtml(link.url || "#")}" target="_blank" rel="noopener noreferrer" class="action-link" aria-label="${escapeHtml(link.label)}" title="${escapeHtml(link.label)}">
              <i class="bi ${escapeHtml(link.icon || "bi-box-arrow-up-right")}" aria-hidden="true"></i>
            </a>
          `
        )
        .join("")}
    </div>
  `;
};

const renderProfile = (profile) => {
  const root = document.getElementById("header-root");
  const about = document.getElementById("about-root");
  const safeLinks = Array.isArray(profile.links) ? profile.links : [];
  const action = profile.printAction || {};
  const actionLabel = action.label || "Descargar CV en PDF";
  const sourceAction = profile.sourceAction || {};
  const sourceLabel = sourceAction.label || "Ver código fuente";

  if (root) {
    root.innerHTML = `
      <div class="container d-flex fd-column ai-center jc-space-between g-4 md:fd-row-reverse">
        <div>
          <img src="${escapeHtml(profile.avatar || "https://i.postimg.cc/cJ41dNRF/elliotgaramendi_cv.webp")}"
            alt="${escapeHtml(profile.avatarAlt || `Perfil de ${profile.name || "Elliot Garamendi"}`)}"
            width="128" height="128" class="image image--avatar">
        </div>
        <div class="d-flex fd-column ai-center g-2 ta-center md:ai-start">
          <div class="d-flex ai-center g-2 fw-wrap">
            <h1 class="title">${escapeHtml(profile.name || "Elliot Garamendi")}</h1>
            <a href="${escapeHtml(sourceAction.url || "#")}"
              class="button button--icon interactive interactive--lg source-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${escapeHtml(sourceLabel)}"
              title="${escapeHtml(sourceLabel)}">
              <i class="bi ${escapeHtml(sourceAction.icon || "bi-github")}" aria-hidden="true"></i>
            </a>
            <button id="download-pdf-btn" type="button" class="button button--icon interactive interactive--lg"
              aria-label="${escapeHtml(actionLabel)}"
              title="${escapeHtml(actionLabel)}">
              <i class="bi ${escapeHtml(action.icon || "bi-download")}" aria-hidden="true"></i>
            </button>
          </div>
          <h2 class="subtitle subtitle--3xs c-ash800">${escapeHtml(profile.headline || "💻 Frontend Developer | 🎓 Docente | 🤖 AI Engineer")}</h2>
          <h3 class="text text--sm c-ash600">${escapeHtml(profile.location || "🌎 Lima, Perú")}</h3>
          <nav class="d-flex g-2">
            ${safeLinks
              .map(
                (link) => `
                  <a href="${escapeHtml(link.url || "#")}" class="link title title--xs c-ash600" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(link.label)}">
                    <i class="bi ${escapeHtml(link.icon || "bi-link-45deg")}" aria-hidden="true"></i>
                  </a>
                `
              )
              .join("")}
          </nav>
        </div>
      </div>
    `;
  }

  if (about) {
    const safeAbout = Array.isArray(profile.about) ? profile.about.join(" ") : profile.about || "";
    about.textContent = safeAbout;
  }
};

const renderFooter = (profile) => {
  const root = document.getElementById("footer-root");
  if (!root) return;
  const footer = profile.footer || "Made with ♥ by";
  const [prefix = "Made with", suffix = "by"] = String(footer).split("♥");

  root.innerHTML = `
    <div class="container">
      <p class="footer__text">
        ${escapeHtml(prefix.trim())}
        <span class="footer__heart" aria-label="amor" role="img">♥</span>
        ${escapeHtml(suffix.trim())}
        <span class="footer__name">${escapeHtml(profile.name || "Elliot Garamendi")}</span>
      </p>
    </div>
  `;
};

const renderExperience = (experience) => {
  const root = document.getElementById("experience-root");
  if (!root) return;

  root.innerHTML = experience
    .map((company) => {
      const roles = Array.isArray(company.roles) ? company.roles : [];
      return `
        <div class="experience-company">
          <h3 class="subtitle subtitle--3xs c-ash950">${escapeHtml(company.company)}</h3>
          <div class="d-flex fd-column g-1">
            ${roles
          .map(
            (role) => `
                  <div class="experience-role">
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

const renderEducation = (education) => {
  const root = document.getElementById("education-root");
  if (!root) return;

  root.innerHTML = education
    .map(
      (item) => `
        <div class="d-flex ai-center jc-space-between g-2 education-item">
          <div>
            <h3 class="subtitle subtitle--3xs c-ash950">${escapeHtml(item.institution)}</h3>
            <h4 class="subtitle subtitle--4xs c-ash600 fw-500">${escapeHtml(item.degree)}</h4>
          </div>
          <div class="education-item__meta">
            <span class="text text--sm c-ash700">${escapeHtml(item.period)}</span>
            <p class="text text--xs c-ash700">${escapeHtml(item.details)}</p>
          </div>
        </div>
      `
    )
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
            <div class="d-flex ai-start jc-space-between g-2">
              <a href="${escapeHtml(project.url || "#")}" target="_blank" rel="noopener noreferrer" class="link interactive interactive--lg c-ash950">
                ${escapeHtml(project.name)}
              </a>
              ${renderActionLinks(project.links)}
            </div>
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
            <div class="d-flex ai-start jc-space-between g-2">
              <h3 class="subtitle subtitle--3xs c-ash900">${escapeHtml(highlight.title)}</h3>
              ${renderActionLinks(highlight.links)}
            </div>
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
  renderProfile(state.profile);
  renderFooter(state.profile);
  renderExperience(state.experience);
  renderEducation(state.education);
  renderProjects(state.projects);
  renderSkills(state.skills);
  renderHighlights(state.highlights);
};

const showFallback = () => {
  const root = document.getElementById("content-source-note");
  if (root) {
    root.textContent =
      `No se pudo cargar el JSON del CV. Verifica la disponibilidad de ${CV_ENDPOINT}.`;
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
  renderProfile({});
  renderFooter({});
  setupPrintButton();

  try {
    const response = await fetch(CV_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.profile = getObject(payload, "profile");
    state.experience = getCollection(payload, "experience");
    state.education = getCollection(payload, "education");
    state.projects = getCollection(payload, "projects");
    state.skills = getCollection(payload, "skills");
    state.highlights = getCollection(payload, "highlights");
    render();
    setupPrintButton();
  } catch (error) {
    showFallback();
    console.error("Error loading CV data", error);
  }
};

bootstrap();
