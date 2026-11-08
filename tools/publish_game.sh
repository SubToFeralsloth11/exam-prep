#!/bin/sh
# Builds a Godot game for the web and publishes it to <pages_repo>'s gh-pages branch under play/,
# so the Exam Quest Arcade can load it from https://subtoferalsloth11.github.io/<pages_repo>/play/.
#
#   tools/publish_game.sh <project_dir> <git_ref> <pages_repo>
#   tools/publish_game.sh ~/Code/timbum main timbum
#   tools/publish_game.sh ~/Code/corner-to-super main corner-to-super-play
#
# GitHub Pages needs a public repo on the free plan. For a private game, name a separate public
# repo (e.g. <game>-play): it's created if missing and only ever holds the web build, never the
# source. Exports a clean worktree of <git_ref>, so uncommitted work in <project_dir> is never
# shipped or touched. Anything else already on gh-pages (e.g. a trailer page) is kept.
set -eu

src=$(cd "$1" && pwd)
ref=$2
repo=$3
owner=SubToFeralsloth11
work=/tmp/webexp/$repo
heavy=$HOME/.agents/bin/heavy

if ! gh repo view "$owner/$repo" >/dev/null 2>&1; then
	gh repo create "$owner/$repo" --public --description "Web build of $(basename "$src") for Exam Quest (build only, no source)" >/dev/null
fi
[ "$(gh repo view "$owner/$repo" --json visibility -q .visibility)" = PUBLIC ] || { echo "$repo is private; GitHub Pages needs a public repo" >&2; exit 1; }

rm -rf "$work"
mkdir -p "$work"
git -C "$src" worktree prune
git -C "$src" worktree add --detach "$work/src" "$ref"
trap 'git -C "$src" worktree remove --force "$work/src" 2>/dev/null; rm -rf "$work"' EXIT

# Reuse the project's import cache (APFS clone: no extra disk) so the export skips a full reimport.
[ -d "$src/.godot" ] && cp -cR "$src/.godot" "$work/src/.godot"

cat >"$work/src/export_presets.cfg" <<'EOF'
[preset.0]

name="Web"
platform="Web"
runnable=true
dedicated_server=false
custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter="docs/*,build/*,tests/*,dev/*,tools/*"
export_path="index.html"

[preset.0.options]

custom_template/debug=""
custom_template/release=""
variant/extensions_support=false
variant/thread_support=false
vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=false
html/export_icon=true
html/custom_html_shell=""
html/head_include="<style>body{touch-action:none;overscroll-behavior:none}</style>"
html/canvas_resize_policy=2
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=false
EOF

mkdir -p "$work/out"
"$heavy" 1800 godot --headless --path "$work/src" --export-release "Web" "$work/out/index.html"
[ -s "$work/out/index.pck" ] && [ -s "$work/out/index.wasm" ] || { echo "export produced no game files" >&2; exit 1; }

# GitHub rejects files over 100 MB, so a big game pack is split into 90 MB parts; the loader
# (tools/game_loader.js) stitches them back together and caches the game files in the browser.
pck=$work/out/index.pck
parts=0
if [ "$(stat -f %z "$pck")" -gt 94371840 ]; then
	split -b 90m -a 3 -d "$pck" "$pck."
	rm "$pck"
	parts=$(find "$work/out" -name 'index.pck.[0-9][0-9][0-9]' | wc -l | tr -d ' ')
fi
loader=$(sed -e "s/__PARTS__/$parts/" -e "s/__REPO__/$repo/" -e "s/__VERSION__/$(git -C "$src" rev-parse --short "$ref")-$(date +%s)/" "$(dirname "$0")/game_loader.js" | grep -v '^ *//')
node -e 'const fs=require("fs"),f=process.argv[1],h=fs.readFileSync(f,"utf8");if(!h.includes("<head>"))process.exit(1);fs.writeFileSync(f,h.replace("<head>",()=>"<head><script>"+process.argv[2]+"</script>"))' "$work/out/index.html" "$loader" ||
	{ echo "could not add the game loader to index.html" >&2; exit 1; }
big=$(find "$work/out" -type f -size +95M)
[ -z "$big" ] || { echo "files too big for GitHub (100 MB limit):" >&2; ls -lh $big >&2; exit 1; }

# Publish into play/ on gh-pages, keeping whatever else lives there. The branch is replaced by a
# single commit each time so old builds don't pile up in the repo.
pages=$work/pages
git init --quiet "$pages"
git -C "$pages" remote add origin "https://github.com/$owner/$repo.git"
if git -C "$pages" fetch --quiet --depth 1 origin gh-pages 2>/dev/null; then
	git -C "$pages" checkout --quiet FETCH_HEAD
fi
git -C "$pages" checkout --quiet --orphan publish
rm -rf "$pages/play"
mkdir -p "$pages/play"
cp "$work/out/"* "$pages/play/"
touch "$pages/.nojekyll"
git -C "$pages" add -A .
git -C "$pages" commit --quiet -m "Publish web build of $(git -C "$src" rev-parse --short "$ref") to play/"
git -C "$pages" -c http.postBuffer=1048576000 push --quiet --force origin publish:gh-pages

# Pages may switch itself on when gh-pages first appears, so a "409 already enabled" is fine.
gh api "repos/$owner/$repo/pages" >/dev/null 2>&1 ||
	gh api -X POST "repos/$owner/$repo/pages" -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null 2>&1 ||
	gh api "repos/$owner/$repo/pages" >/dev/null
echo "published https://subtoferalsloth11.github.io/$repo/play/ ($(du -sh "$work/out" | cut -f1))"
