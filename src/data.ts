const CDN =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F'

/** Image hébergée sur le CDN, à la largeur demandée (1920 par défaut, comme la spec). */
export const cdn = (file: string, w = 1920) => `${CDN}${file}&w=${w}&q=85`

export const BACKGROUND = cdn('hf_20260624_151236_784929aa-a992-4292-9938-1dd9b5296a29.png')
/** Photo de profil reprise de https://quentincontreau.com/about */
export const PROFILE_PHOTO = '/profile.jpg'

export type Lang = 'fr' | 'en'
/** Texte bilingue. */
export type L<T = string> = { fr: T; en: T }

export type Project = {
  /** Sert aussi d'ancre d'URL : /#airmap ouvre directement le projet. */
  id: string
  title: string
  /** Position de l'ancre en % (desktop). */
  anchor: { x: number; y: number }
  /** Position de l'ancre en % sur mobile (< 640px). */
  mobileAnchor: { x: number; y: number }
  /** Visuel grand format (fenêtre projet). */
  image: string
  /** Miniature légère (cartes, galerie). */
  thumb: string
  /** Vidéo de présentation (remplace le visuel dans la fenêtre). */
  video?: { src: string; poster: string }
  tag: L
  description: L
  /** Lien vers le projet en ligne (absent = pas encore publié). */
  link?: string
}

// Projets repris de https://quentincontreau.com/ (section Projets, FR + EN).
// Visuels stockés en local dans public/projects (WebP 1600px + miniature 240px).
export const PROJECTS: Project[] = [
  {
    id: 'langage-sensei',
    title: 'Langage-Sensei',
    anchor: { x: 26, y: 29.5 },
    mobileAnchor: { x: 28, y: 18 },
    image: '/projects/langage-sensei.webp',
    thumb: '/projects/langage-sensei-thumb.webp',
    tag: { fr: 'Design produit', en: 'Product design' },
    description: { fr: 'Parcours progressifs et micro-interactions.', en: 'Progressive pathways and micro-interactions.' },
    link: 'https://langage-sensei.netlify.app/',
  },
  {
    id: 'movesmart',
    title: 'MoveSmart',
    anchor: { x: 66.08, y: 19.63 },
    mobileAnchor: { x: 72, y: 25 },
    image: '/projects/movesmart.webp',
    thumb: '/projects/movesmart-thumb.webp',
    tag: { fr: 'Dév créatif', en: 'Creative development' },
    description: {
      fr: 'Calcul d’itinéraires, inventaire et suivi des étapes clés.',
      en: 'Route calculation, inventory and tracking of key stages.',
    },
    link: 'https://movesmart.netlify.app/',
  },
  {
    id: 'blog-v1',
    title: 'Blog.V1',
    // À droite de la tasse du fond (avant : 42.75 / 48.5, au centre).
    anchor: { x: 82, y: 41 },
    mobileAnchor: { x: 28, y: 43 },
    image: '/projects/blog-v1.webp',
    thumb: '/projects/blog-v1-thumb.webp',
    tag: { fr: 'Ops produit', en: 'Product ops' },
    description: { fr: 'Suivi personnel.', en: 'Personal tracking dashboard.' },
    link: 'https://blogv1qc.netlify.app/',
  },
  {
    id: 'airmap',
    title: 'AirMap',
    anchor: { x: 23.33, y: 60.88 },
    mobileAnchor: { x: 72, y: 50 },
    image: '/projects/airmap.webp',
    thumb: '/projects/airmap-thumb.webp',
    tag: { fr: 'Ops produit', en: 'Product ops' },
    description: {
      fr: 'Corrélations entre pollution de l’air et conditions météorologiques.',
      en: 'Correlation between pollution metrics and weather conditions.',
    },
    link: 'https://airmap.dyskolos.fr/',
  },
  {
    id: 'notch2',
    title: 'Notch2.0',
    anchor: { x: 68, y: 62.13 },
    mobileAnchor: { x: 50, y: 68 },
    image: '/projects/notch.webp',
    thumb: '/projects/notch-thumb.webp',
    video: { src: '/videos/notch2.mp4', poster: '/videos/notch2-poster.webp' },
    tag: { fr: 'Nouveau projet', en: 'New project' },
    description: { fr: 'Notch bar conçue pour macOS.', en: 'Custom notch bar designed for macOS.' },
  },
]

// Textes repris de https://quentincontreau.com/about (FR + EN), sauf « Univers visuel ».
export const ABOUT = {
  name: 'Quentin Contreau',
  title: { fr: 'Développeur créatif freelance & VibeDev', en: 'Freelance creative developer & VibeDev' },
  role: { fr: 'Développeur créatif', en: 'Creative developer' },
  location: 'Lyon, France',
  status: { fr: 'Disponible', en: 'Available' },
  email: 'quentin@ynov.com',
  intro: {
    fr: 'Développeur créatif basé en France, passionné par l’art numérique, le creative coding et l’animation 3D. Je recherche en continu des missions freelance ou en équipe pour concevoir des expériences digitales soignées.',
    en: 'Creative developer based in France, passionate about digital art, creative coding, and 3D animation. Always looking for exciting freelance or team opportunities to build beautiful digital experiences.',
  },
  school: {
    fr: 'Actuellement en 3e année de Bachelor Développement à Ynov Campus Lyon, avec une spécialisation web. À terme, je souhaite renforcer mon expertise en design web pendant mon cycle Master.',
    en: 'I am currently in my third year of a Bachelor’s degree in Development at Ynov Campus Lyon, focused on web development. During my Master’s cycle, I plan to deepen my specialization in web design.',
  },
  process: {
    fr: 'Je commence par un brief clair, puis je propose une direction visuelle rapide. Ensuite, je construis un MVP pour une première démonstration client. Après validation, je passe au développement complet, aux tests et aux optimisations avant mise en ligne.',
    en: 'I start with a clear brief, then propose a quick visual direction. Next, I build an MVP for an initial client review. Once validated, I move to full development, testing, and optimization before launch.',
  },
  style: {
    title: { fr: 'Univers visuel', en: 'Visual universe' },
    body: {
      fr: [
        'J’aime l’esthétique technical mono et le new utilitarian : des objets et des interfaces qui ressemblent à des instruments. Aluminium brut, gris neutres, typographie fine et technique, et une seule couleur d’accent — un orange vif — réservée à ce qui compte vraiment.',
        'Chaque élément a une fonction visible ; la beauté vient de la précision : grilles, pictogrammes, détails gravés, boutons qu’on a envie de presser. C’est cette rigueur que je cherche dans mes interfaces : peu d’éléments, beaucoup de soin, et des micro-interactions qui donnent l’impression de manipuler un vrai objet.',
      ],
      en: [
        'I love the technical mono and new utilitarian aesthetic: objects and interfaces that feel like instruments. Raw aluminium, neutral greys, fine technical typography, and a single accent colour — a bright orange — kept for what really matters.',
        'Every element has a visible purpose; beauty comes from precision: grids, pictograms, engraved details, buttons you want to press. That rigour is what I look for in my interfaces: few elements, a lot of care, and micro-interactions that feel like handling a real object.',
      ],
    },
    tags: {
      fr: ['Technical mono', 'New utilitarian', 'Monochrome', 'Accent orange', 'Typo technique', 'Fonctionnel'],
      en: ['Technical mono', 'New utilitarian', 'Monochrome', 'Orange accent', 'Technical type', 'Functional'],
    },
    palette: [
      { name: { fr: 'Alu', en: 'Alu' }, color: 'rgb(226, 226, 224)' },
      { name: { fr: 'Gris', en: 'Grey' }, color: 'rgb(170, 170, 168)' },
      { name: { fr: 'Graphite', en: 'Graphite' }, color: 'rgb(58, 58, 60)' },
      { name: { fr: 'Orange', en: 'Orange' }, color: 'rgb(255, 79, 31)' },
    ],
  },
  contribute: {
    fr: ['Développement front-end.', 'Développement back-end.', 'Optimisation des performances web.'],
    en: ['Front-end development.', 'Back-end development.', 'Web performance optimization.'],
  },
  tech: ['React', 'TypeScript', 'GSAP', 'Framer', 'Tailwind', 'UI / UX', 'lenis'],
  tools: ['Figma', 'FlutterFlow', 'Always Data', 'Airtable', 'Postman', 'FireBase', 'SupaBase', 'Git', 'Wix', 'Wordpress', 'Bubble'],
  values: {
    fr: ['Esprit d’équipe', 'Créativité', 'Innovation', 'Adaptabilité'],
    en: ['Team spirit', 'Creativity', 'Innovation', 'Adaptability'],
  },
  keywords: {
    fr: ['Design', 'UI', 'UX', 'Ergonomie', 'Simplicité'],
    en: ['Design', 'UI', 'UX', 'Ergonomics', 'Simplicity'],
  },
  outside: {
    fr: 'Passionné par le sport, le dessin, la photo/vidéo, la mode, la musique et les voyages.',
    en: 'Passionate about sports, drawing, photo/video, fashion, music, and travel.',
  },
  outsideItems: [
    { title: { fr: 'Mode', en: 'Fashion' }, text: { fr: 'Silhouettes, matières.', en: 'Silhouettes, materials.' } },
    { title: { fr: 'Musique', en: 'Music' }, text: { fr: 'Rythme, ambiance.', en: 'Rhythm, ambience.' } },
    { title: { fr: 'Voyages', en: 'Travel' }, text: { fr: 'Découvrir, apprendre.', en: 'Explore and learn.' } },
  ],
  contactTagline: {
    fr: 'Contactez-moi pour collaborer ou simplement échanger.',
    en: 'Contact me for collaboration or just to say hi.',
  },
}

export type Note = {
  id: string
  title: L
  date: L
  body: L
  /** Texte animé (ThinkingText) affiché juste après le corps de la note. */
  status?: L
}

export const NOTES: Note[] = [
  {
    id: 'en-ce-moment',
    title: { fr: 'En ce moment', en: 'Right now' },
    date: { fr: '16 oct. 2026', en: 'Oct 16, 2026' },
    body: {
      fr: '• Ce bureau : un portfolio façon macOS, fenêtres et dock compris.\n• NotchPack : le site de présentation, déjà en ligne.\n\nToujours ouvert aux missions freelance ou en équipe.',
      en: '• This desktop: a macOS-style portfolio, windows and dock included.\n• NotchPack: the showcase site, already live.\n\nAlways open to freelance or team projects.',
    },
    status: { fr: 'Disponible', en: 'Available' },
  },
  {
    id: 'stack',
    title: { fr: 'Stack du moment', en: 'Current stack' },
    date: { fr: '10 oct. 2026', en: 'Oct 10, 2026' },
    body: {
      fr: 'Front : React, TypeScript, Tailwind, GSAP, Lenis, Framer.\nBack : Node, Supabase, Firebase, MySQL / MariaDB.\nOutils : Figma, Postman, Git, Notion, Netlify, Hostinger.\n\nÀ creuser : Three.js et WebGL pour aller plus loin dans la 3D.',
      en: 'Front: React, TypeScript, Tailwind, GSAP, Lenis, Framer.\nBack: Node, Supabase, Firebase, MySQL / MariaDB.\nTools: Figma, Postman, Git, Notion, Netlify, Hostinger.\n\nNext up: Three.js and WebGL to go further with 3D.',
    },
  },
  {
    id: 'process',
    title: { fr: 'Mon process', en: 'My process' },
    date: { fr: '2 oct. 2026', en: 'Oct 2, 2026' },
    body: {
      fr: '1. Un brief clair.\n2. Une direction visuelle rapide.\n3. Un MVP pour une première démo client.\n4. Après validation : développement complet, tests, optimisations, mise en ligne.',
      en: '1. A clear brief.\n2. A quick visual direction.\n3. An MVP for a first client demo.\n4. Once validated: full development, testing, optimization, launch.',
    },
  },
  {
    id: 'inspirations',
    title: { fr: 'Inspirations', en: 'Inspirations' },
    date: { fr: '24 sept. 2026', en: 'Sep 24, 2026' },
    body: {
      fr: 'MacOs : Images, animations typées... ; Technical mono, new utilitarian : des interfaces qui ressemblent à des instruments...\n\nGris neutres, typo technique, un seul accent de couleur. Chaque élément a une fonction visible, et les micro-interactions donnent l’impression de manipuler un vrai objet...',
      en: 'macOS: images, signature animations... ; Technical mono, new utilitarian: interfaces that feel like instruments...\n\nNeutral greys, technical type, a single accent colour. Every element has a visible purpose, and micro-interactions feel like handling a real object...',
    },
  },
  {
    id: 'formation',
    title: { fr: 'Formation', en: 'Education' },
    date: { fr: '15 sept. 2026', en: 'Sep 15, 2026' },
    body: {
      fr: '3e année de Bachelor Développement à Ynov Campus Lyon, spécialisation web.\n\nObjectif : renforcer mon expertise en design web pendant le cycle Master.',
      en: 'Third year of a Bachelor’s in Development at Ynov Campus Lyon, web track.\n\nGoal: deepen my web design expertise during the Master’s cycle.',
    },
  },
]

export const SOCIALS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '/icons/linkedin.svg',
    href: 'https://www.linkedin.com/in/quentin-c-752996294/',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: '/icons/github.svg',
    href: 'https://github.com/Tokennn',
  },
  {
    id: 'notchpack',
    label: 'NotchPack',
    icon: '/icons/notchpack.webp',
    href: 'https://notchpack.netlify.app/',
  },
]

export const NOTES_ICON = 'https://framerusercontent.com/images/4ar8CL6aUtjymV8jTsXrcPzXCM.svg'
