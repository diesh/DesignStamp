# DesignStamp — Claude Notes

## Dev environment
- Using Claude Code CLI locally — always `git pull` first before starting a session
- Write files to disk, then `git add && git commit && git push`
- Write multiple files in parallel (one Write tool call each, same message) before committing
- Work directly on `main` for solo dev — no need for feature branches

## Render
- Serves from `cocktail/public/` as root
- Auto-deploys from `main` — always push to `main`

## Firebase
- DB: `https://cocktail-49fc4-default-rtdb.firebaseio.com`
- Rules currently open (`.read: true, .write: true`) — acceptable for beta
- Sessions namespaced under `sessions/{code}/config` and `sessions/{code}/submissions/`

## Spirit identity
- Spirits stored as `{ label: 'A', codeName: '...' }` — use `s.label`, never `s.id`
- Submission keys: `${person}_${spiritLabel}` (spaces replaced with `_`)
