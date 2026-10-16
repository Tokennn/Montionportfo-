/**
 * Fond du bureau :
 * - 'photo'  : photo sombre de la spec (textes blancs) — version actuellement en ligne.
 * - 'coffee' : essai clair, photo de la tasse entière et centrée sur fond beige (textes brun foncé).
 * Pour revenir à la photo, remplace simplement BACKGROUND_MODE par 'photo'.
 */
export type BackgroundMode = 'photo' | 'coffee'

export const BACKGROUND_MODE: BackgroundMode = 'coffee'

const THEMES = {
  photo: {
    pageBg: 'white',
    gradientOpacity: 0.4,
    cardTitle: 'rgb(247, 247, 247)',
    cardTitleShadow: '0 1px 8px rgba(0, 0, 0, 0.25)',
    cardHoverBorder: 'rgba(255, 255, 255, 0.2)',
    cardHoverBg: 'rgba(0, 0, 0, 0.16)',
    thumbBorder: 'rgba(255, 255, 255, 0.2)',
    glassBg: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    dockSeparator: 'rgba(255, 255, 255, 0.2)',
    dockDot: 'rgba(255, 255, 255, 0.85)',
    text: 'rgba(247, 247, 247, 0.85)',
    textShadow: '0 1px 8px rgba(0, 0, 0, 0.25)',
    footerText: 'rgba(247, 247, 247, 0.85)',
    footerShadow: '0 1px 8px rgba(0, 0, 0, 0.25)',
    langActiveBg: 'white',
    langActiveText: 'black',
  },
  coffee: {
    // Même dégradé que le fond de la photo (plus foncé en bas) pour que les bords se raccordent.
    pageBg: 'linear-gradient(180deg, rgb(203, 174, 145) 0%, rgb(190, 161, 124) 100%)',
    gradientOpacity: 0.08,
    // Titres des projets en blanc (légère ombre pour rester lisibles sur le beige).
    cardTitle: 'rgba(255, 255, 255, 0.95)',
    cardTitleShadow: '0 1px 6px rgba(52, 40, 30, 0.35)',
    cardHoverBorder: 'rgba(52, 40, 30, 0.12)',
    cardHoverBg: 'rgba(255, 255, 255, 0.3)',
    thumbBorder: 'rgba(52, 40, 30, 0.12)',
    glassBg: 'rgba(255, 255, 255, 0.3)',
    glassBorder: 'rgba(52, 40, 30, 0.12)',
    dockSeparator: 'rgba(52, 40, 30, 0.18)',
    dockDot: 'rgba(52, 40, 30, 0.75)',
    text: 'rgba(52, 40, 30, 0.8)',
    textShadow: 'none',
    // Mentions du bas en blanc (légère ombre pour rester lisible sur le beige).
    footerText: 'rgba(255, 255, 255, 0.95)',
    footerShadow: '0 1px 6px rgba(52, 40, 30, 0.35)',
    langActiveBg: 'rgb(52, 40, 30)',
    langActiveText: 'rgb(240, 228, 214)',
  },
}

export const THEME = THEMES[BACKGROUND_MODE]

export const COFFEE_IMAGE = '/backgrounds/coffee-beige.webp'
