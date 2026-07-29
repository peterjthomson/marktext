#!/usr/bin/env bash
# Regenerates the macOS .icns from the full-bleed 1024px source icon.
#
# macOS app icons are not full-bleed. Apple's icon grid puts the icon body in an
# 824x824 rounded square centred on a 1024x1024 canvas — 100px of transparent
# padding on every side. An icon that fills the canvas edge-to-edge renders
# noticeably larger than every system icon beside it in the Dock.
#
# Only the mac icon gets this treatment: Windows (.ico) and Linux (.png) expect
# full-bleed artwork, so they keep using the source untouched.
#
# The source already carries the correct corner radius (~0.23 of its width vs
# Apple's 0.225), so this only rescales and pads — the artwork is not re-masked.
#
#   ./build/make-mac-icns.sh   # from packages/desktop
#
# Requires ImageMagick (brew install imagemagick) and iconutil (Xcode CLT).

set -euo pipefail

cd "$(dirname "$0")/.."
SRC="static/oh-my-marktext/icon.png"
OUT="static/oh-my-marktext/icon.icns"

CANVAS=1024
BODY=824 # Apple's icon grid for a 1024px canvas.

command -v magick >/dev/null || {
  echo "make-mac-icns: ImageMagick not found (brew install imagemagick)" >&2
  exit 1
}

src_w=$(magick identify -format '%w' "$SRC")
[ "$src_w" -ge "$CANVAS" ] || {
  echo "make-mac-icns: $SRC is ${src_w}px, need >= ${CANVAS}px" >&2
  exit 1
}

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
SET="$WORK/icon.iconset"
mkdir -p "$SET"

# The padded master every size is derived from.
magick "$SRC" -resize "${BODY}x${BODY}" -background none \
  -gravity center -extent "${CANVAS}x${CANVAS}" "$WORK/master.png"

# Both entries of each pair are required; iconutil rejects an incomplete set.
for spec in 16:16x16 32:16x16@2x 32:32x32 64:32x32@2x 128:128x128 256:128x128@2x \
  256:256x256 512:256x256@2x 512:512x512 1024:512x512@2x; do
  px=${spec%%:*}
  name=${spec##*:}
  magick "$WORK/master.png" -resize "${px}x${px}" "$SET/icon_${name}.png"
done

iconutil -c icns "$SET" -o "$OUT"
echo "make-mac-icns: wrote $OUT ($(stat -f%z "$OUT") bytes)"
