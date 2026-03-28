

## Problem Analysis

From the edge function logs, the root cause is clear:

1. **Image generation currently uses Lovable AI gateway** (`generateImage` function, lines 66-128), NOT OpenRouter
2. **Base64 images are filtered out** for OpenRouter calls — `getOpenRouterCompatibleImages` only keeps `https://` URLs, but user-uploaded images are all base64 data URLs
3. The Lovable AI gateway model `google/gemini-2.5-flash-image` inconsistently returns images — sometimes returning only text (see log: `"content":"好的，请看这张专业电商产品图：\n\n"` with no image)

The user wants a unified pipeline: **all calls (text analysis + image generation) go through OpenRouter with their own API key**, including sending base64 uploaded images for multimodal analysis.

## Plan

### 1. Rewrite `generate-listing` edge function — unified OpenRouter pipeline

**Remove**: `LOVABLE_AI_URL`, `generateImage` function, `getOpenRouterCompatibleImages` filter

**Replace with**: A single `callOpenRouterMultimodal` function that:
- Accepts base64 data URLs directly (OpenRouter supports `data:image/...;base64,...` in `image_url` type content)
- Sends all 6 steps through OpenRouter
- For image generation steps (Step 4 & 6), uses a multimodal model capable of image output (e.g. `google/gemini-2.5-flash` with image input for analysis, then generates a descriptive prompt that OpenRouter image models can use)

**Key change for image steps**: Since most OpenRouter models return text (not images), the approach will be:
- Use `google/gemini-2.5-flash` (or admin-configured model) with uploaded base64 images as multimodal input
- The model analyzes the product images and generates a detailed image description/prompt
- Then call an OpenRouter image generation model (like `black-forest-labs/flux-schnell` or admin-configured model) to produce the actual image
- Parse the response for base64 image data or image URLs

**If OpenRouter returns images inline** (some models like `google/gemini-2.5-flash-image` on OpenRouter do), extract from `message.content` or `message.images`.

### 2. Fix base64 image passthrough

Remove the `isRemoteImageUrl` filter entirely. Build multimodal content arrays that include base64 data URLs directly:

```typescript
content.push({ 
  type: "image_url", 
  image_url: { url: "data:image/png;base64,..." } 
});
```

### 3. Unified image generation via OpenRouter

Replace the `generateImage` function with `generateImageViaOpenRouter`:
- Sends the prompt + reference images (base64) to OpenRouter
- Uses the admin-configured model from template panel (defaulting to `google/gemini-2.5-flash-image` or similar)
- Parses response for inline base64 images, markdown image URLs, or `images` array
- Returns the image URL/data for frontend display

### 4. Frontend — no changes needed

The `GenerationResults` component already handles both URLs and base64 data URIs in `<img src={...}>`. The `ImagePlaceholder` and `CarouselGallery` components work with any valid image source.

## Files to modify

| File | Change |
|------|--------|
| `supabase/functions/generate-listing/index.ts` | Remove Lovable AI gateway; unify all calls through OpenRouter; support base64 in multimodal requests |

## Technical details

- OpenRouter multimodal API supports `data:image/*;base64,...` in `image_url.url` field
- The `DEFAULT_IMAGE_MODEL` will be changed from `black-forest-labs/flux-schnell` to an OpenRouter-compatible image generation model (configurable via admin templates)
- All 6 pipeline steps will use a single `callOpenRouterMultimodal` that handles both text-only and image+text requests
- Error handling will surface specific OpenRouter error codes (402/429) to the frontend

