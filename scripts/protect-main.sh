#!/usr/bin/env bash
# Configura la protección de la rama main para que no se pueda
# hacer merge ni push directo si el check "CI OK" no está en verde.
#
# Requiere: GitHub CLI autenticado (gh auth login) y que la rama main
# ya exista en el remoto y el workflow .github/workflows/ci.yml se haya
# ejecutado al menos una vez.
#
# Uso:
#   ./scripts/protect-main.sh            # repo del directorio actual
#   ./scripts/protect-main.sh owner/repo # otro repo

set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
BRANCH="${BRANCH:-main}"

echo "🔒 Protegiendo $REPO@$BRANCH (required check: CI OK)..."

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$REPO/branches/$BRANCH/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["CI OK"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "✅ Listo: main exige PR + check 'CI OK' en verde."
