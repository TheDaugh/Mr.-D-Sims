---
name: ispy-art-pipeline
description: Making the I-Spy scene art (background plates, prop objects, vehicles) with an image generator. Load before writing any image prompt, cutting or colouring a prop sheet, or setting up image-generation automation for the I-Spy scenes.
---

# I-Spy art pipeline

## Working rules

- **One change at a time.** Make one change, show it, and wait for approval before the next. Do not run a long batch and show nothing in between.
- **Show before scaling.** A single test image is the unit of review. Do not generate sheets until the single test has been approved.
- **Say what is being tested.** Each message names the one thing changed and what to look for.

## Why objects looked pasted on

- The background is a camera looking down at about 35° with perspective.
- The prop sheets were flat side views, drawn separately, with their own lighting and no ground contact.
- A flat side view in a looking-down world reads as a Flat Stanley cut-out.
- Cutting and cropping cannot fix this. Angle, depth and shading are wrong at the source, so the fix belongs in the prompt.

## Prompt rules

**Same camera.** Give the generator the finished background as a reference image. Ask for each object at that exact angle and elevation.
- Static objects (bench, bin, cart): one view.
- Objects that move or turn (scooters, buses, taxis): two to four views, Kenney-style, not eight.
- Vehicles in these scenes only travel along the road's axis, so two views is usually enough.

**Scale and light.**
- Say where each object sits and how big it is relative to its neighbours.
- Light comes from the upper left, soft and overcast, to match the plate.
- No cast shadow. The engine draws its own.

**Colour.**
- No pink anywhere. No pink bus, no red-patterned socks.
- Use blue, yellow, green, white, orange and teal.
- Red reads as pink at the edges.

**Background colour key.**
- Use a flat neutral grey, or a colour no object on that sheet uses, as the key.
- Do not use magenta. The magenta bled into every edge and produced the pink fringing. It was inherited from the first stall prompt, and the green in earlier previews was only a checking colour.
- Shave the edges after keying.

## Preferred test

Ask the generator to draw one object into the actual background, for example a scooter in the middle parking space. Then lift it out of that image. It inherits the correct perspective and lighting. Try this on one scooter and show the result before doing anything else.

## Generating images

Image generation needs a Gemini API key. Check for it before attempting anything:

- Variable name: `GEMINI_API_KEY`.
- If it is missing, tell the user. Do not attempt generation and do not mock results.
- The key is added in the cloud environment settings (menu in the session title bar, then Edit, then environment variables or API credentials). A new session picks it up.
- Never ask the user to paste a key into chat.
- Keys come from Google AI Studio (aistudio.google.com, "Get API key"). Whether image generation is free depends on the model and current quotas; check the Gemini API pricing page before assuming it is free.
- The network policy must allow the Gemini API host. If a request is denied, name the host and point the user to the environment's Network access settings.

## Connectors

- The Canva connector failed to connect in this session (proxy returned 403). It needs a fix on the connector side before it can be used.
- Adobe and OpenAI image hosts were blocked by the proxy.

## Next steps, in order

1. The user adds `GEMINI_API_KEY` to the environment and confirms the Gemini host is allowed.
2. Generate one scooter placed in the middle parking space, lift it out, and show it.
3. Wait for approval. Only then redo the prompts file or generate further objects.
