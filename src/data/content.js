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
    heading: 'I make sense of messy data.',
    paragraphs: [
      "I'm a final-year engineering student in Data & AI. Most of my work starts the same way: a folder of spreadsheets nobody trusts, and a deadline. I build the pipeline that fixes that, then the model that uses it.",
      "I care most about data engineering and predictive modeling — less about the theory, more about whether the thing actually runs in production. I spent my last internship doing exactly that at SPI International (Canal+ Group).",
    ],
    tags: [
      { icon: 'briefcase', label: 'Ex-SPI International (Canal+)' },
      { icon: 'cap', label: 'Data & AI · final year' },
      { icon: 'zap', label: 'ML in production' },
    ],
    exploring: 'currently exploring',
    exploringWhat: '▸ MLOps & deployment',
    photoAlt: 'Portrait of Oscar Hunaut',
  },

  skills: {
    label: '// 02 — SKILLS',
    heading: 'What I actually work with.',
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
    heading: 'Projects I actually finished.',
    screenshotAlt: '{title} — project screenshot',
    items: [
      {
        title: 'RenovTaCana',
        category: 'Web GIS Application',
        // Picture slot: drop an image on the card tile (saved in your browser), or
        // put the real screenshot at public/assets/renovtacana.webp so visitors see it.
        imageSlot: true,
        image: '/assets/renovtacana.webp',
        description:
          'A GIS web app that maps which pipes need renovating and why, cross-referencing network data to help prioritize the work. Built with a small Agile team, where I owned the entire front-end: the map, the layers, and how the data actually gets shown.',
        highlight: 'I owned the entire front-end',
        tech: ['GeoJSON', 'Leaflet', 'JavaScript', 'GIS'],
        github: 'https://github.com/JulesCinc/RenovTaCana',
      },
      {
        title: 'Real-Time Bidding',
        category: 'Machine Learning · Kaggle',
        description:
          'A Kaggle competition on predicting real-time ad-auction outcomes — mostly a lesson in how far feature engineering and handling class imbalance can take you. Landed north of an 0.78 F1-score.',
        tech: ['Python', 'scikit-learn', 'XGBoost', 'pandas'],
        github: 'https://github.com/CrispyChicken2/Kaggle-comp_bidding_prediction',
      },
      {
        title: '2026 World Cup predictor',
        category: 'Machine Learning · Sports Analytics',
        description:
          'An end-to-end pipeline that forecasts the 2026 World Cup — group stage, knockout bracket, champion, even the final score. Under the hood: causal Elo ratings, a double-Poisson goal model, and Monte-Carlo simulation, all checked against a leakage-free temporal backtest (55.7% accuracy on match outcomes).',
        tech: ['Python', 'scikit-learn', 'pandas', 'NumPy', 'SciPy'],
        github: 'https://github.com/CrispyChicken2/World-Cup-2026-predictor-',
      },
    ],
  },

  experience: {
    label: '// 04 — EXPERIENCE & EDUCATION',
    heading: 'How I got here.',
    items: [
      {
        period: 'INTERNSHIP',
        role: 'Data Engineering Intern',
        org: 'SPI International (Canal+ Group)',
        note: "Built ETL pipelines and automated Power BI dashboards tracking brand awareness and other metrics across Europe. The data sources were a mess when I started; the reporting wasn't, by the time I left.",
        active: true,
      },
      {
        period: '2022 — 2027',
        role: 'Engineering Degree · Data & AI',
        org: 'EPF Engineering School',
        note: 'Five-year engineering degree, specializing in Data & AI. Equal parts data engineering, machine learning, and applied statistics — with enough all-nighters in between to make it official.',
        active: false,
      },
    ],
  },

  contact: {
    label: "// 05 — LET'S TALK",
    headingLines: ["Let's build something", 'that actually ships.'],
    blurb: "I'm on the hunt for a Data / ML internship. My inbox doesn't bite — say hello.",
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
    heading: 'Je remets de l\'ordre dans les données.',
    paragraphs: [
      "Étudiant-ingénieur en dernière année, spécialisation Data & IA. Mes missions commencent presque toujours pareil : un tableur que plus personne ne veut ouvrir, et une échéance. Je construis le pipeline qui répare ça, puis le modèle qui s'en sert.",
      "Ce qui m'intéresse vraiment, c'est le data engineering et la modélisation prédictive — moins la théorie, plus la question de savoir si le modèle tourne encore une fois en prod. C'est exactement ce que j'ai fait pendant mon stage chez SPI International (Groupe Canal+).",
    ],
    tags: [
      { icon: 'briefcase', label: 'Ex-SPI International (Canal+)' },
      { icon: 'cap', label: 'Data & IA · dernière année' },
      { icon: 'zap', label: 'ML en production' },
    ],
    exploring: 'en ce moment',
    exploringWhat: '▸ MLOps & déploiement',
    photoAlt: "Portrait d'Oscar Hunaut",
  },

  skills: {
    label: '// 02 — COMPÉTENCES',
    heading: 'Ce que j\'utilise, concrètement.',
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
    heading: 'Des projets que j\'ai menés à bon port.',
    screenshotAlt: '{title} — capture du projet',
    items: [
      {
        title: 'RenovTaCana',
        category: 'Application SIG web',
        imageSlot: true,
        image: '/assets/renovtacana.webp',
        description:
          "Une appli SIG qui cartographie les canalisations à rénover et pourquoi, en croisant les données du réseau pour prioriser les interventions. Développée en petite équipe façon Agile, où j'ai pris en charge tout le front-end : la carte, les couches, et la façon dont les données sont présentées.",
        highlight: "j'ai pris en charge tout le front-end",
        tech: ['GeoJSON', 'Leaflet', 'JavaScript', 'GIS'],
        github: 'https://github.com/JulesCinc/RenovTaCana',
      },
      {
        title: 'Real-Time Bidding',
        category: 'Machine Learning · Kaggle',
        description:
          "Une compétition Kaggle sur la prédiction d'enchères publicitaires en temps réel — surtout un cours accéléré sur ce que le feature engineering et la gestion du déséquilibre des classes peuvent apporter. Score final : un F1 au-dessus de 0,78.",
        tech: ['Python', 'scikit-learn', 'XGBoost', 'pandas'],
        github: 'https://github.com/CrispyChicken2/Kaggle-comp_bidding_prediction',
      },
      {
        title: 'Prédire la Coupe du Monde 2026',
        category: 'Machine Learning · Analyse sportive',
        description:
          "Un pipeline complet qui prédit la Coupe du Monde 2026 — phase de groupes, tableau final, champion, jusqu'au score de la finale. Sous le capot : des ratings Elo causaux, un modèle de buts double-Poisson et une simulation Monte-Carlo, le tout validé par un backtest temporel sans fuite de données (55,7 % de précision sur les résultats des matchs).",
        tech: ['Python', 'scikit-learn', 'pandas', 'NumPy', 'SciPy'],
        github: 'https://github.com/CrispyChicken2/World-Cup-2026-predictor-',
      },
    ],
  },

  experience: {
    label: '// 04 — EXPÉRIENCE & FORMATION',
    heading: "Comment j'en suis arrivé là.",
    items: [
      {
        period: 'STAGE',
        role: 'Stagiaire Data Engineering',
        org: 'SPI International (Groupe Canal+)',
        note: "Conception de pipelines ETL et de tableaux de bord Power BI automatisés pour suivre la notoriété de marque et d'autres indicateurs à travers l'Europe. Les sources de données étaient un vrai bazar au départ ; le reporting, beaucoup moins à la fin.",
        active: true,
      },
      {
        period: '2022 — 2027',
        role: "Diplôme d'Ingénieur · Data & IA",
        org: "EPF École d'ingénieurs",
        note: "Diplôme d'ingénieur en cinq ans, spécialisation Data & IA. Un mélange de data engineering, de machine learning et de statistiques appliquées — avec suffisamment de nuits blanches pour que ce soit officiel.",
        active: false,
      },
    ],
  },

  contact: {
    label: '// 05 — PARLONS-EN',
    headingLines: ['Construisons quelque chose', 'qui tient la route.'],
    blurb: "Je suis à la recherche d'un stage Data / ML. Ma boîte mail ne mord pas — n'hésitez pas à écrire.",
    copyEmail: "Copier l'e-mail",
    copied: 'Copié !',
  },
}

export const locales = { en, fr }
