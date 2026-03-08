# Mount Sinai vs Anthem 2026

Rock 'Em Sock 'Em Robots-style web page with two robots facing each other.

## Project Structure

- `index.html` — Main page. Two robot images on a black background.
- `sprites/` — Rendered robot sprites (2048x2048 PNGs with transparency).
  - `robot_full_blue.png` / `robot_full_red.png` — Full robot images used on the current page.
  - `robot_{part}_{color}.png` — Individual body part sprites (head, torso, upper_arm_front/back, forearm_front/back, leg_front/back) for puppet-style canvas animation. See git history for the canvas game implementation.
- `robots.blend` — Blender source file with the robot 3D models.

## Blender Setup (for re-rendering sprites)

1. Open `robots.blend` in Blender.
2. Install the [blender-mcp](https://github.com/ahujasid/blender-mcp) addon (`addon.py` from that repo → Edit > Preferences > Add-ons > Install).
3. In Blender's 3D View, press N → BlenderMCP tab → Connect to Claude.
4. The MCP server is configured in the project's `.claude.json` as `blender` using `uvx blender-mcp` (requires `uv` installed via mise).

## Re-rendering Sprites

The robot model is imported from `/Users/zhammer/Downloads/source/Robots.fbx`. The scene has Robot1 (at y≈0) and Robot2 (at y≈-0.06) — they're the same model. Groups 4/5 are Robot1's arms, groups 2/3 are Robot2's.

Camera: orthographic, `SpriteCamera`, looking from +X along -X. Render settings: 2048x2048, transparent background, EEVEE.

Colors (set on Principled BSDF Base Color):
- Blue: `(20/255, 75/255, 229/255)` — RGB(20, 75, 229)
- Red/Pink: `(0.85, 0.0, 0.35)` — hot pink/magenta

Materials are set to glossy plastic: Roughness 0.25, Specular IOR Level 0.8, Coat Weight 0.4, Coat Roughness 0.1.

## Previous Work

The first git commit contains a full canvas-based fighting game with puppet animation (separate body part sprites, keyboard controls, health bars, punch/hit animations). That code can be restored from git history.

## Blender Lock

Only one agent may use Blender MCP at a time. Before executing any `mcp__blender__execute_blender_code` calls:

1. Check if `/Users/zhammer/code/me/mountsinaivsanthem2026/.blender-lock` exists.
2. If it exists, **do not use Blender**. Wait or ask the lock holder to release.
3. If it doesn't exist, create it with your agent name as content (e.g., `echo "blender-artist" > .blender-lock`).
4. When done with Blender, delete the lock file (`rm .blender-lock`).

The team lead must also follow this protocol. If two agents use Blender simultaneously, renders will conflict.

## Serving Locally

```
python3 -m http.server 8080
```

Open http://localhost:8080.
