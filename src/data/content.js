// =====================================================================
//  PORTFOLIO CONTENT
//  Edit everything from this single file.
//  ⚠️  Update your GitHub / LinkedIn URLs in `social` and per project.
// =====================================================================

export const profile = {
  name: 'Oscar Hunaut',
  role: 'Data & AI Engineering Student',
  tagline: 'Aspiring ML/AI Engineer',
  available: 'Open to Data / ML / AI internships and graduate roles.',
  short:
    'Final-year engineering student in Data & AI. I build data pipelines, predictive models, and explore quantitative finance.',
}

export const social = {
  // 👉 Replace with your real profiles if they differ.
  github: 'https://github.com/CrispyChicken2',
  linkedin: 'https://www.linkedin.com/in/oscar-hunaut-767923333',
  email: 'oscarhunaut02@gmail.com',
}

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export const about = [
  "I'm a final-year engineering student specializing in Data & Artificial Intelligence. I enjoy turning messy, large-scale data into reliable pipelines and clear, decision-ready insights.",
  'My focus areas are data engineering, predictive modeling, and quantitative finance — I gravitate toward problems where rigorous modeling meets real-world impact.',
  'Most recently, I interned in Data Engineering at SPI International (Canal+ Group), where I designed ETL pipelines and automated Power BI reporting to analyze brand awareness across Europe.',
]

export const skills = [
  { group: 'Languages', items: ['Python', 'R', 'SQL', 'JavaScript'] },
  { group: 'Data & BI', items: ['Power BI', 'pandas', 'numpy'] },
  { group: 'Machine Learning & AI', items: ['Scikit-Learn', 'XGBoost', 'CatBoost'] },
  { group: 'Web & GIS', items: ['HTML/CSS', 'Leaflet.js', 'GeoJSON', 'SQLite'] },
  { group: 'DevOps & Tools', items: ['Git', 'CI/CD', 'Docker', 'Github Actions'] },
]

export const experiences = [
  {
    period: 'Internship',
    role: 'Data Engineering Intern',
    company: 'SPI International (Canal+ Group)',
    description:
      'Designed ETL pipelines and built automated Power BI dashboards to analyze brand awareness and other metrics across Europe, turning fragmented data sources into reliable, decision-ready reporting.',
    tech: ['Python', 'pandas', 'Power BI', 'DAX'],
  },
]

export const projects = [
  {
    title: 'RenovTaCana',
    category: 'Web GIS Application',
    description:
      'A web-based GIS application to map and analyze pipe-renovation needs. Interactive geospatial visualization that cross-references network data to prioritize interventions.',
    tech: ['GeoJSON', 'Leaflet', 'JavaScript', 'GIS', "AGILE methodology"],
    github: 'https://github.com/JulesCinc/RenovTaCana',
  },
  {
    title: 'Real-Time Bidding',
    category: 'Machine Learning · Kaggle',  
    description:
      'A Kaggle competition predicting real-time auction outcomes. Focused on feature engineering, class-imbalance handling, and model tuning to push past an F1-score of 0.78.',
    tech: ['Python', 'scikit-learn', 'XGBoost', 'pandas'],
    github: 'https://github.com/CrispyChicken2/Kaggle-comp_bidding_prediction.git',
    metric: { value: '0.78+', label: 'target F1-score' },
  },
  {
    title: '2026 World Cup predictor',
    category: 'Machine Learning · Sports Analytics',
    description:
      'An end-to-end pipeline forecasting the 2026 FIFA World Cup: group qualifiers and scores, the full knockout bracket, the champion and the final score. Combines causal Elo ratings, a double-Poisson goal model and Monte-Carlo tournament simulation, validated by a leakage-free temporal backtest.',
    tech: ['Python', 'scikit-learn', 'pandas', 'NumPy', 'SciPy'],
    github: 'https://github.com/CrispyChicken2/World-Cup-2026-predictor-.git',
    metric: { value: '55.7%', label: 'backtest 1X2 accuracy' },
  },
]

// ---------------------------------------------------------------------
//  Extra content for the dark AI/ML layout (edit freely)
// ---------------------------------------------------------------------

// Hero: the gradient line shown under the name.
export const heroLine = 'builds data-driven systems.'

// Hero: words that rotate inside the description.
export const focusWords = [
  'data engineering',
  'machine learning',
  'predictive modeling',
  'quantitative finance',
]

// Hero stat strip (honest, derived from real work).
export const stats = [
  { value: '3', label: 'PROJECTS SHIPPED' },
  { value: '0.78', label: 'KAGGLE F1-SCORE' },
  { value: '55.7%', label: 'WORLD-CUP BACKTEST ACC' },
]

export const aboutTags = [
  '🎓 Data & AI · final year',
  '💼 Ex-SPI International (Canal+)',
  '⚡ Quant-curious',
]

export const education = [
  {
    period: 'EXPECTED 2026',
    role: 'Engineering Degree · Data & AI',
    org: 'EPF Engineering' ,
    note: 'Final-year studies in data engineering, machine learning and applied statistics.',
  },
]
