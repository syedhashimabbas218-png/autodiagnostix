#!/usr/bin/env bash
# =============================================================================
# generate_hero_images.sh
# Pipeline: product image + reference images → 3 realistic Flux hero variations
#
# Usage:
#   ./generate_hero_images.sh
#
# Directory layout:
#   hero/
#   ├── reference/           ← style reference images
#   │   ├── ref1.jpg
#   │   └── ref2.jpg
#   ├── product1.jpg         ← product images (jpg/png/webp)
#   ├── product2.png
#   └── generate_hero_images.sh
#
# Output:
#   hero/output/<product_name>/
#   ├── prompts.json         ← structured prompts from vision model
#   ├── variation_1.png
#   ├── variation_2.png
#   └── variation_3.png
# =============================================================================

set -euo pipefail

# ── Rate limit config (NVIDIA Build free tier) ────────────────────────────────
DELAY_BETWEEN_CALLS=6          # seconds between every API call
DELAY_BETWEEN_PRODUCTS=15      # seconds between products
MAX_RETRIES=4                  # max retries per call
RETRY_BASE_DELAY=10            # seconds — doubles on each retry (exponential backoff)

# ── Model config ──────────────────────────────────────────────────────────────
VISION_MODEL="nvidia/meta/llama-3.2-11b-vision-instruct"
IMAGE_MODEL="nvidia/black-forest-labs/flux.1-dev"

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REFERENCE_DIR="$SCRIPT_DIR/reference"
OUTPUT_DIR="$SCRIPT_DIR/output"
IMAGE_EXTENSIONS=("jpg" "jpeg" "png" "webp")

# ── Logging ───────────────────────────────────────────────────────────────────
log()      { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()       { echo -e "\033[1;32m[ OK ]\033[0m  $*"; }
warn()     { echo -e "\033[1;33m[WARN]\033[0m  $*"; }
err()      { echo -e "\033[1;31m[ERR ]\033[0m  $*" >&2; }
step()     { echo -e "\033[1;35m[STEP]\033[0m  $*"; }
wait_msg() { echo -e "\033[0;90m[WAIT]\033[0m  $*"; }

# ── Helpers ───────────────────────────────────────────────────────────────────
b64()       { base64 -w 0 "$1" 2>/dev/null || base64 "$1"; }
mime_type() {
  case "${1##*.}" in
    jpg|jpeg) echo "image/jpeg" ;;
    png)      echo "image/png"  ;;
    webp)     echo "image/webp" ;;
    *)        echo "image/jpeg" ;;
  esac
}

rate_sleep() {
  local seconds="$1"
  local reason="${2:-rate limit}"
  wait_msg "Waiting ${seconds}s (${reason})..."
  sleep "$seconds"
}

# ── Retry wrapper ─────────────────────────────────────────────────────────────
call_with_retry() {
  local -n _result_ref=$1
  shift
  local attempt=1
  local delay=$RETRY_BASE_DELAY

  while [[ $attempt -le $MAX_RETRIES ]]; do
    local output exit_code
    output=$("$@" 2>&1) && exit_code=0 || exit_code=$?

    if [[ $exit_code -eq 0 ]]; then
      _result_ref="$output"
      return 0
    fi

    if echo "$output" | grep -qiE "429|rate.?limit|too.?many.?request|quota"; then
      local backoff=$(( delay * attempt ))
      warn "Rate limited (attempt $attempt/$MAX_RETRIES). Backing off ${backoff}s..."
      rate_sleep "$backoff" "rate limit backoff"
    else
      warn "Call failed (attempt $attempt/$MAX_RETRIES): $output"
      [[ $attempt -lt $MAX_RETRIES ]] && rate_sleep "$delay" "retry wait"
    fi

    (( attempt++ ))
  done

  err "All $MAX_RETRIES attempts failed."
  return 1
}

# ── Dependency check ──────────────────────────────────────────────────────────
for cmd in opencode jq curl base64; do
  if ! command -v "$cmd" &>/dev/null; then
    err "Required command not found: $cmd"
    exit 1
  fi
done

# ── Collect reference images ──────────────────────────────────────────────────
log "Scanning reference images in: $REFERENCE_DIR"
REF_IMAGES=()
for ext in "${IMAGE_EXTENSIONS[@]}"; do
  while IFS= read -r -d '' f; do
    REF_IMAGES+=("$f")
  done < <(find "$REFERENCE_DIR" -maxdepth 1 -iname "*.${ext}" -print0 2>/dev/null)
done

if [[ ${#REF_IMAGES[@]} -eq 0 ]]; then
  err "No reference images found in $REFERENCE_DIR"
  exit 1
fi
log "Found ${#REF_IMAGES[@]} reference image(s)"

# ── Build reference content blocks ───────────────────────────────────────────
build_ref_blocks() {
  local json="["
  for img in "${REF_IMAGES[@]}"; do
    local mime; mime=$(mime_type "$img")
    local b64data; b64data=$(b64 "$img")
    json+="{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:${mime};base64,${b64data}\"}},"
  done
  json+="{\"type\":\"text\",\"text\":\"These are REFERENCE hero images. Deeply analyze: composition rules, subject placement, background treatment, lighting sources and direction, color palette, depth of field, mood, and post-processing style.\"}]"
  echo "$json"
}

# ── System prompt for vision model ───────────────────────────────────────────
SYSTEM_PROMPT='You are an expert commercial photographer and AI image prompt engineer specializing in photorealistic product hero shots for e-commerce and advertising.

Your job is to analyze reference hero images and a product image, then output a JSON object with exactly 3 prompt variations for Flux.1-dev image generation.

CRITICAL RULES:
- Respond with ONLY raw JSON. No markdown, no backticks, no explanation.
- Every prompt must produce a PHOTOREALISTIC result — shot on a real camera, real lighting, real textures. No CGI, no illustration, no painting.
- Each variation must be a distinctly different mood and composition.

Output this exact JSON schema:
{
  "product_name": "string",
  "variations": [
    {
      "id": 1,
      "mood": "short mood label",
      "prompt": {
        "subject": "detailed product description, material, finish, exact placement in frame",
        "background": "specific background — color, texture, gradient, depth, environment details",
        "lighting": "lighting type, angle, color temperature, shadows (e.g. soft studio key light at 45 degrees left, warm 5500K, subtle fill from right, long shadow on surface)",
        "camera": "lens mm, aperture, angle (e.g. 85mm portrait lens, f/1.8, slight low angle, background bokeh)",
        "color_grade": "color treatment (e.g. desaturated cool shadows, warm amber highlights, muted earthy palette)",
        "atmosphere": "surface, reflections, props, particles, fog, steam, depth elements",
        "quality_tags": "photorealistic, hyperrealistic, 8K UHD, RAW photo, shot on Hasselblad, commercial product photography, hero shot, ultra sharp focus, professional studio, award-winning advertising photography, Unreal Engine render quality, --ar 16:9"
      },
      "flux_prompt": "single combined optimized string of all fields above, written as a natural dense prompt for Flux.1-dev"
    }
  ]
}'

# ── Generate prompts via vision model ─────────────────────────────────────────
generate_prompts() {
  local product_image="$1"
  local product_name="$2"

  step "[$product_name] Calling vision model..."

  local product_mime; product_mime=$(mime_type "$product_image")
  local product_b64; product_b64=$(b64 "$product_image")
  local ref_blocks; ref_blocks=$(build_ref_blocks)

  local user_content
  user_content=$(jq -n \
    --argjson ref "$ref_blocks" \
    --arg mime "$product_mime" \
    --arg b64 "$product_b64" \
    --arg name "$product_name" \
    '($ref) + [
      {
        "type": "image_url",
        "image_url": {"url": ("data:" + $mime + ";base64," + $b64)}
      },
      {
        "type": "text",
        "text": (
          "This is the PRODUCT IMAGE for: \"" + $name + "\"\n\n" +
          "Generate 3 hero image prompt variations for this product.\n" +
          "Each must target a completely different mood, lighting style, and composition — inspired by the reference images.\n\n" +
          "Realism requirements:\n" +
          "- Real camera physics: lens compression, natural bokeh, realistic shadows\n" +
          "- Real lighting: studio strobes, natural window light, or environmental light — all physically plausible\n" +
          "- Real surfaces: reflections, micro-textures, material properties\n" +
          "- No glowing effects, no surreal edits, no CGI sheen\n\n" +
          "Output ONLY the raw JSON object. Nothing else."
        )
      }
    ]')

  local payload
  payload=$(jq -n \
    --arg model "$VISION_MODEL" \
    --arg system "$SYSTEM_PROMPT" \
    --argjson content "$user_content" \
    '{
      model: $model,
      system: $system,
      messages: [{"role": "user", "content": $content}],
      max_tokens: 2000,
      temperature: 0.7
    }')

  local raw_response
  call_with_retry raw_response opencode chat --model "$VISION_MODEL" --json "$payload"
  echo "$raw_response"
}

# ── Extract and validate JSON ─────────────────────────────────────────────────
extract_prompts_json() {
  local raw="$1"

  local text
  text=$(echo "$raw" | jq -r '
    .choices[0].message.content //
    .content[0].text //
    empty
  ' 2>/dev/null)

  if [[ -z "$text" ]]; then
    err "Could not extract text from vision model response"
    return 1
  fi

  # Strip accidental markdown fences
  text=$(echo "$text" | sed 's/^```json//; s/^```//; s/```$//' | sed '/^$/d')

  if ! echo "$text" | jq . &>/dev/null; then
    err "Vision model did not return valid JSON. Raw output:"
    echo "$text" >&2
    return 1
  fi

  echo "$text"
}

# ── Generate one image with Flux ──────────────────────────────────────────────
generate_image() {
  local flux_prompt="$1"
  local output_path="$2"
  local label="$3"

  step "  Generating: $label"

  local payload
  payload=$(jq -n \
    --arg model "$IMAGE_MODEL" \
    --arg prompt "$flux_prompt" \
    '{
      model: $model,
      prompt: $prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      response_format: "b64_json"
    }')

  local raw_response
  call_with_retry raw_response opencode image --model "$IMAGE_MODEL" --json "$payload" || {
    warn "  image endpoint failed, trying generate..."
    call_with_retry raw_response opencode generate --model "$IMAGE_MODEL" --json "$payload" || {
      err "  All image generation attempts failed for: $label"
      return 1
    }
  }

  local b64img
  b64img=$(echo "$raw_response" | jq -r '.data[0].b64_json // empty' 2>/dev/null)

  if [[ -n "$b64img" ]]; then
    echo "$b64img" | base64 -d > "$output_path"
    ok "  → $(basename "$output_path")"
  else
    local img_url
    img_url=$(echo "$raw_response" | jq -r '.data[0].url // empty' 2>/dev/null)
    if [[ -n "$img_url" ]]; then
      curl -sL "$img_url" -o "$output_path"
      ok "  → $(basename "$output_path") (from URL)"
    else
      warn "  No image data in response — saving debug JSON"
      echo "$raw_response" > "${output_path%.png}_debug.json"
    fi
  fi

  rate_sleep "$DELAY_BETWEEN_CALLS" "post-image call"
}

# ── Main ──────────────────────────────────────────────────────────────────────
mkdir -p "$OUTPUT_DIR"

PRODUCT_IMAGES=()
for ext in "${IMAGE_EXTENSIONS[@]}"; do
  while IFS= read -r -d '' f; do
    PRODUCT_IMAGES+=("$f")
  done < <(find "$SCRIPT_DIR" -maxdepth 1 -iname "*.${ext}" -print0 2>/dev/null)
done

if [[ ${#PRODUCT_IMAGES[@]} -eq 0 ]]; then
  err "No product images found in $SCRIPT_DIR"
  exit 1
fi

TOTAL=${#PRODUCT_IMAGES[@]}
log "Found $TOTAL product image(s) to process"
log "Rate limit config: ${DELAY_BETWEEN_CALLS}s between calls, ${DELAY_BETWEEN_PRODUCTS}s between products, ${MAX_RETRIES} retries"
echo ""

for i in "${!PRODUCT_IMAGES[@]}"; do
  product_img="${PRODUCT_IMAGES[$i]}"
  filename=$(basename "$product_img")
  product_name="${filename%.*}"
  product_output="$OUTPUT_DIR/$product_name"
  mkdir -p "$product_output"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Product $((i+1))/$TOTAL: $product_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Step 1: Vision model → structured prompts
  raw_response=$(generate_prompts "$product_img" "$product_name") || {
    err "Skipping $product_name — vision model failed"
    continue
  }

  rate_sleep "$DELAY_BETWEEN_CALLS" "post-vision call"

  prompts_json=$(extract_prompts_json "$raw_response") || {
    err "Skipping $product_name — JSON parse failed"
    continue
  }

  echo "$prompts_json" | jq . > "$product_output/prompts.json"
  ok "Prompts saved → $product_output/prompts.json"
  echo ""
  echo "$prompts_json" | jq -r '.variations[] | "  Variation \(.id) — \(.mood)"'
  echo ""

  # Step 2: Flux → 3 images
  variation_count=$(echo "$prompts_json" | jq '.variations | length')

  for (( v=0; v<variation_count; v++ )); do
    mood=$(echo "$prompts_json"        | jq -r ".variations[$v].mood")
    flux_prompt=$(echo "$prompts_json" | jq -r ".variations[$v].flux_prompt")
    var_num=$(echo "$prompts_json"     | jq -r ".variations[$v].id")
    out_path="$product_output/variation_${var_num}.png"

    generate_image "$flux_prompt" "$out_path" "Variation $var_num — $mood"
  done

  ok "[$product_name] Complete → $product_output"
  echo ""

  # Pause between products
  if [[ $((i+1)) -lt $TOTAL ]]; then
    rate_sleep "$DELAY_BETWEEN_PRODUCTS" "between products"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ok "All done. Results in: $OUTPUT_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
