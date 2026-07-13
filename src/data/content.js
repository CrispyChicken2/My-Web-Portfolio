// =====================================================================
//  PORTFOLIO CONTENT — bilingual (en / fr)
//  Edit everything from this single file. Both dictionaries share the
//  same shape; components read the active one via useLang().
// =====================================================================

// Shared, language-independent data.
export const social = {
  github: 'https://github.com/CrispyChicken2',
  linkedin: 'https://www.linkedin.com/in/oscar-hunaut-767923333',
  email: 'oscarhunaut02@gmail.com',
}

const en = {
  meta: {
    title: 'Oscar Hunaut — Data & AI Engineering Student',
  },

  profile: {
    name: 'Oscar Hunaut',
    available: 'Open to Data / ML / AI internships',
  },

  // Nav links (Contact is rendered as its own button).
  navLinks: [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ],

  nav: {
    contact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    primary: 'Primary',
    skipLink: 'Skip to content',
  },

  hero: {
    line: 'builds data-driven systems.',
    roles: ['predictive modeling', 'data engineering', 'machine learning', 'data pipelines'],
    sentencePrefix: 'Data & AI Engineering student focused on',
    sentenceSuffix: '— turning data into models that ship, from pipelines to prediction.',
    viewProjects: 'View Projects →',
    getInTouch: 'Get in touch',
    scrollLabel: 'Scroll to content',
  },

  about: {
    label: '// 01 — ABOUT',
    heading: 'From first principles to production.',
    paragraphs: [
      "I'm a final-year engineering student specializing in Data & Artificial Intelligence. I enjoy turning messy, large-scale data into reliable pipelines and clear, decision-ready insights.",
      'My focus areas are data engineering and predictive modeling — I gravitate toward problems where rigorous modeling meets real-world impact. Most recently I interned in Data Engineering at SPI International (Canal+ Group).',
    ],
    tags: [
      { icon: 'briefcase', label: 'Ex-SPI International (Canal+)' },
      { icon: 'cap', label: 'Data & AI · final year' },
      { icon: 'zap', label: 'ML in production' },
    ],
    exploring: 'currently exploring',
    exploringWhat: '▸ MLOps & deployment',
    photoAlt: 'Add your photo',
  },

  skills: {
    label: '// 02 — SKILLS',
    heading: 'The stack I think in.',
    groups: [
      { group: 'Machine Learning & AI', icon: 'cpu', tone: 'green', items: ['Scikit-Learn', 'XGBoost', 'CatBoost'] },
      { group: 'Data & BI', icon: 'chart', tone: 'olive', items: ['Power BI', 'pandas', 'numpy', 'DAX'] },
      { group: 'Languages', icon: 'code', tone: 'neutral', items: ['Python', 'R', 'SQL', 'JavaScript'] },
      { group: 'DevOps & Tools', icon: 'terminal', tone: 'neutral', items: ['Git', 'CI/CD', 'Docker', 'Github Actions'] },
      { group: 'Web & GIS', icon: 'globe', tone: 'neutral', items: ['HTML/CSS', 'Leaflet.js', 'GeoJSON', 'SQLite'] },
    ],
  },

  projects: {
    label: '// 03 — SELECTED WORK',
    heading: "Projects I'm proud of.",
    addScreenshot: 'Add a {title} screenshot',
    replacePicture: 'Replace picture',
    items: [
      {
        title: 'RenovTaCana',
        category: 'Web GIS Application',
        // Picture slot: drop an image on the card tile (saved in your browser), or
        // put the real screenshot at public/assets/renovtacana.webp so visitors see it.
        imageSlot: true,
        image: '/assets/renovtacana.webp',
        description:
          'A web-based GIS application to map and analyze pipe-renovation needs — interactive geospatial visualization that cross-references network data to prioritize interventions. Team project (Agile workflow) where I was in charge of the entire front-end — the map UI, layers and data visualization.',
        highlight: 'Team project (Agile workflow) where I was in charge of the entire front-end',
        tech: ['GeoJSON', 'Leaflet', 'JavaScript', 'GIS'],
        github: 'https://github.com/JulesCinc/RenovTaCana',
      },
      {
        title: 'Real-Time Bidding',
        category: 'Machine Learning · Kaggle',
        description:
          'A Kaggle competition predicting real-time auction outcomes. Focused on feature engineering, class-imbalance handling, and model tuning to push past an F1-score of 0.78.',
        tech: ['Python', 'scikit-learn', 'XGBoost', 'pandas'],
        github: 'https://github.com/CrispyChicken2/Kaggle-comp_bidding_prediction',
      },
      {
        title: '2026 World Cup predictor',
        category: 'Machine Learning · Sports Analytics',
        description:
          'An end-to-end pipeline forecasting the 2026 FIFA World Cup: group qualifiers, the knockout bracket, the champion and the final score. Combines causal Elo ratings, a double-Poisson goal model and Monte-Carlo simulation, validated by a leakage-free temporal backtest (55.7% 1X2 accuracy).',
        tech: ['Python', 'scikit-learn', 'pandas', 'NumPy', 'SciPy'],
        github: 'https://github.com/CrispyChicken2/World-Cup-2026-predictor-',
      },
    ],
  },

  experience: {
    label: '// 04 — EXPERIENCE & EDUCATION',
    heading: 'The path so far.',
    items: [
      {
        period: 'INTERNSHIP',
        role: 'Data Engineering Intern',
        org: 'SPI International (Canal+ Group)',
        note: 'Designed ETL pipelines and built automated Power BI dashboards to analyze brand awareness and other metrics across Europe, turning fragmented data sources into reliable, decision-ready reporting.',
        active: true,
      },
      {
        period: '2022 — 2027',
        role: 'Engineering Degree · Data & AI',
        org: 'EPF Engineering School',
        note: "Five-year engineering degree (Diplôme d'Ingénieur) with a specialization in Data & Artificial Intelligence — data engineering, machine learning and applied statistics.",
        active: false,
      },
    ],
  },

  contact: {
    label: "// 05 — LET'S TALK",
    headingLines: ["Let's build something", 'that learns.'],
    blurb: "I'm looking for a Data / ML internship. The inbox is always open — say hello.",
    copyEmail: 'Copy email',
    copied: 'Copied!',
  },
}

const fr = {
  meta: {
    title: 'Oscar Hunaut — Étudiant-ingénieur Data & IA',
  },

  profile: {
    name: 'Oscar Hunaut',
    available: 'En recherche de stage — Data · ML · IA',
  },

  navLinks: [
    { id: 'about', label: 'À propos' },
    { id: 'skills', label: 'Compétences' },
    { id: 'projects', label: 'Projets' },
    { id: 'experience', label: 'Expérience' },
    { id: 'contact', label: 'Contact' },
  ],

  nav: {
    contact: 'Contact',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    primary: 'Navigation principale',
    skipLink: 'Aller au contenu',
  },

  hero: {
    line: 'fait parler les données.',
    roles: ['modélisation prédictive', 'data engineering', 'machine learning', 'pipelines de données'],
    sentencePrefix: 'Étudiant-ingénieur en Data & IA, spécialisé en',
    sentenceSuffix: '— je transforme les données en modèles qui tournent en production, du pipeline à la prédiction.',
    viewProjects: 'Voir les projets →',
    getInTouch: 'Me contacter',
    scrollLabel: 'Défiler vers le contenu',
  },

  about: {
    label: '// 01 — À PROPOS',
    heading: 'Des fondamentaux à la production.',
    paragraphs: [
      "Étudiant-ingénieur en dernière année, spécialisé en Data & Intelligence Artificielle. J'aime transformer des données brutes et volumineuses en pipelines fiables et en analyses claires, directement exploitables.",
      "Mes domaines de prédilection : le data engineering et la modélisation prédictive — je suis attiré par les problèmes où la rigueur du modèle se traduit en impact concret. Récemment, j'ai effectué un stage en Data Engineering chez SPI International (Groupe Canal+).",
    ],
    tags: [
      { icon: 'briefcase', label: 'Ex-SPI International (Canal+)' },
      { icon: 'cap', label: 'Data & IA · dernière année' },
      { icon: 'zap', label: 'ML en production' },
    ],
    exploring: 'en ce moment',
    exploringWhat: '▸ MLOps & déploiement',
    photoAlt: 'Ajouter ma photo',
  },

  skills: {
    label: '// 02 — COMPÉTENCES',
    heading: 'Ma stack au quotidien.',
    groups: [
      { group: 'Machine Learning & IA', icon: 'cpu', tone: 'green', items: ['Scikit-Learn', 'XGBoost', 'CatBoost'] },
      { group: 'Data & BI', icon: 'chart', tone: 'olive', items: ['Power BI', 'pandas', 'numpy', 'DAX'] },
      { group: 'Langages', icon: 'code', tone: 'neutral', items: ['Python', 'R', 'SQL', 'JavaScript'] },
      { group: 'DevOps & Outils', icon: 'terminal', tone: 'neutral', items: ['Git', 'CI/CD', 'Docker', 'Github Actions'] },
      { group: 'Web & SIG', icon: 'globe', tone: 'neutral', items: ['HTML/CSS', 'Leaflet.js', 'GeoJSON', 'SQLite'] },
    ],
  },

  projects: {
    label: '// 03 — PROJETS PHARES',
    heading: 'Des projets dont je suis fier.',
    addScreenshot: 'Ajouter une capture de {title}',
    replacePicture: "Remplacer l'image",
    items: [
      {
        title: 'RenovTaCana',
        category: 'Application SIG web',
        imageSlot: true,
        image: '/assets/renovtacana.webp',
        description:
          "Une application SIG web pour cartographier et analyser les besoins de rénovation des canalisations : une visualisation géospatiale interactive qui croise les données du réseau pour prioriser les interventions. Projet d'équipe (méthode Agile) où j'étais en charge de tout le front-end — l'interface cartographique, les couches et la visualisation des données.",
        highlight: "Projet d'équipe (méthode Agile) où j'étais en charge de tout le front-end",
        tech: ['GeoJSON', 'Leaflet', 'JavaScript', 'GIS'],
        github: 'https://github.com/JulesCinc/RenovTaCana',
      },
      {
        title: 'Real-Time Bidding',
        category: 'Machine Learning · Kaggle',
        description:
          "Une compétition Kaggle : prédire l'issue d'enchères publicitaires en temps réel. Au programme : feature engineering, gestion du déséquilibre des classes et optimisation du modèle pour dépasser un F1-score de 0,78.",
        tech: ['Python', 'scikit-learn', 'XGBoost', 'pandas'],
        github: 'https://github.com/CrispyChicken2/Kaggle-comp_bidding_prediction',
      },
      {
        title: 'Prédire la Coupe du Monde 2026',
        category: 'Machine Learning · Analyse sportive',
        description:
          "Un pipeline de bout en bout pour prédire la Coupe du Monde 2026 : les qualifiés des groupes, le tableau final, le champion et le score de la finale. Il combine des ratings Elo causaux, un modèle de buts double-Poisson et une simulation de Monte-Carlo, le tout validé par un backtest temporel sans fuite de données (55,7 % de précision 1X2).",
        tech: ['Python', 'scikit-learn', 'pandas', 'NumPy', 'SciPy'],
        github: 'https://github.com/CrispyChicken2/World-Cup-2026-predictor-',
      },
    ],
  },

  experience: {
    label: '// 04 — EXPÉRIENCE & FORMATION',
    heading: 'Mon parcours.',
    items: [
      {
        period: 'STAGE',
        role: 'Stagiaire Data Engineering',
        org: 'SPI International (Groupe Canal+)',
        note: "Conception de pipelines ETL et de tableaux de bord Power BI automatisés pour analyser la notoriété de marque et d'autres indicateurs à travers l'Europe — des sources de données fragmentées transformées en un reporting fiable et directement exploitable.",
        active: true,
      },
      {
        period: '2022 — 2027',
        role: "Diplôme d'Ingénieur · Data & IA",
        org: "EPF École d'ingénieurs",
        note: "Cursus ingénieur en cinq ans, spécialisation Data & Intelligence Artificielle — data engineering, machine learning et statistiques appliquées.",
        active: false,
      },
    ],
  },

  contact: {
    label: '// 05 — PARLONS-EN',
    headingLines: ['Construisons quelque chose', 'qui apprend.'],
    blurb: "Je recherche un stage en Data / ML. Ma boîte mail est toujours ouverte — écrivez-moi !",
    copyEmail: "Copier l'e-mail",
    copied: 'Copié !',
  },
}

export const locales = { en, fr }
