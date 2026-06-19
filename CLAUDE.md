# DesignStamp — Claude Notes

## Git / Push workflow
- Always write files to disk first, then `git add && git commit && git push`
- Never try to inline large HTML/JS as JSON in MCP tool parameters — it always fails and wastes time
- Write multiple files in parallel (one Write tool call each, same message) before committing

## Dev branch
- Branch: `claude/tequila-tasting-app-q9qOV`
- Render serves from `cocktail/public/` as root

## Firebase
- DB: `https://cocktail-49fc4-default-rtdb.firebaseio.com`
- Rules currently open (`.read: true, .write: true`) — acceptable for beta
- Sessions namespaced under `sessions/{code}/config` and `sessions/{code}/submissions/`

## Spirit identity
- Spirits stored as `{ label: 'A', codeName: '...' }` — use `s.label`, never `s.id`
- Submission keys: `${person}_${spiritLabel}` (spaces replaced with `_`)
