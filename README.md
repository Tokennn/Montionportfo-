# Motionportfo — portfolio de Quentin Contreau

Hero plein écran façon bureau macOS : 5 projets (repris de quentincontreau.com) en cartes déplaçables, un dock, et des fenêtres (projet, About, Notes).

Stack : React 19 + Vite 8 + TypeScript. Tailwind est installé (plugin Vite) mais tous les styles sont inline dans le JSX.

## Lancer

```bash
nvm use        # Node 24 (.nvmrc)
npm install
npm run dev    # http://localhost:5190
```

## Où modifier

- `src/data.ts` : projets (titres, positions desktop/mobile, textes), bio, notes, réseaux.
- `src/hooks/useDraggable.ts` : drag souris + tactile, contraint à l'écran.
- `src/components/WindowShell.tsx` : fenêtre partagée (entrée/sortie ressort, barre de titre draggable).
