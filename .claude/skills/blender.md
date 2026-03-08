---
name: blender
description: Edit 3D robot models and re-render sprites using Blender MCP. Use when modifying robot appearance, poses, materials, or re-rendering sprite sheets.
---

# Blender Editing

Edit the robot 3D models and re-render sprites via the Blender MCP server.

## Prerequisites

1. Blender must be open with `robots.blend` loaded.
2. The BlenderMCP addon must be connected (3D View > N panel > BlenderMCP > Connect to Claude).
3. The MCP server is configured in `.claude.json` as `blender` using `uvx blender-mcp`.

## Lock Protocol

**Only one agent may use Blender at a time.**

1. Check if `.blender-lock` exists in the project root.
2. If it exists, **stop** — another agent is using Blender.
3. If not, create it: `echo "your-agent-name" > .blender-lock`
4. When done, delete it: `rm .blender-lock`

## Scene Layout

- **Robot1** at y≈0, **Robot2** at y≈-0.06 (same model, different positions)
- Vertex groups 4/5 = Robot1's arms, groups 2/3 = Robot2's arms
- Camera: `SpriteCamera`, orthographic, looking from +X along -X
- Render: 2048x2048, transparent background, EEVEE

## Materials

Set on Principled BSDF:
- **Blue**: Base Color `(20/255, 75/255, 229/255)` — RGB(20, 75, 229)
- **Red/Pink**: Base Color `(0.85, 0.0, 0.35)` — hot pink/magenta
- Roughness: 0.25, Specular IOR Level: 0.8, Coat Weight: 0.4, Coat Roughness: 0.1

## Rendering Workflow

**Only render blue sprites from Blender.** Red sprites are generated via HSV hue-shift.

### Render Blue Sprites

Use `mcp__blender__execute_blender_code` to:
1. Position/pose the robot as needed
2. Set materials to blue
3. Render to `public/sprites/robot_{part}_blue.png`

### Generate Red from Blue

Run the hue-shift Python script (see CLAUDE.md for full code):

```bash
python3 -c "
from PIL import Image
import numpy as np
# ... hue_shift_blue_to_red function ...
for part in ['head','torso','upper_arm_front','forearm_front','upper_arm_back','forearm_back','leg_front','leg_back','full']:
    hue_shift_blue_to_red(f'public/sprites/robot_{part}_blue.png', f'public/sprites/robot_{part}_red.png')
"
```

**Key**: Red is always derived from blue. This keeps geometry identical so the same punch pivot points work for both robots. The web app flips red with `scaleX(-1)`.

## Sprite Parts

Each robot has these separately-rendered parts:
- `head`, `torso`
- `upper_arm_front`, `upper_arm_back`
- `forearm_front`, `forearm_back`
- `leg_front`, `leg_back`
- `full` (complete robot, used for reference)

## Blender MCP Tools

- `mcp__blender__execute_blender_code` — Run Python code in Blender
- `mcp__blender__get_scene_info` — Inspect scene objects
- `mcp__blender__get_object_info` — Inspect specific object
- `mcp__blender__get_viewport_screenshot` — Preview current viewport
- `mcp__blender__set_texture` — Set object textures
