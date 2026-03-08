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

## Red Sprites (from Blue)

Red sprites are generated from blue sprites via HSV hue-shift in Python — NOT rendered separately in Blender. This ensures identical geometry and joint positions. The web app flips the red robot with `scaleX(-1)` on `.red .robot-parts` so both robots share the same pivot points.

To regenerate red sprites from blue:

```python
from PIL import Image
import numpy as np

def hue_shift_blue_to_red(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img, dtype=np.float32)
    mask = arr[:,:,3] > 10
    r, g, b = arr[:,:,0][mask]/255, arr[:,:,1][mask]/255, arr[:,:,2][mask]/255

    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin

    h = np.zeros_like(r)
    m_r = (cmax == r) & (delta > 0)
    m_g = (cmax == g) & (delta > 0)
    m_b = (cmax == b) & (delta > 0)
    h[m_r] = (((g[m_r] - b[m_r]) / delta[m_r]) % 6) / 6
    h[m_g] = (((b[m_g] - r[m_g]) / delta[m_g]) + 2) / 6
    h[m_b] = (((r[m_b] - g[m_b]) / delta[m_b]) + 4) / 6

    s = np.where(cmax > 0, delta / cmax, 0)
    v = cmax
    h = (h + 0.4) % 1.0        # shift blue→red
    s = np.clip(s * 1.1, 0, 1)  # slight saturation boost

    c2 = v * s
    x = c2 * (1 - np.abs((h * 6) % 2 - 1))
    m = v - c2
    h6 = h * 6
    nr = ng = nb = np.zeros_like(h)
    for lo, hi, rc, gc, bc in [(0,1,c2,x,0),(1,2,x,c2,0),(2,3,0,c2,x),(3,4,0,x,c2),(4,5,x,0,c2),(5,6,c2,0,x)]:
        idx = (h6 >= lo) & (h6 < hi)
        nr = np.where(idx, rc, nr); ng = np.where(idx, gc, ng); nb = np.where(idx, bc, nb)
    nr += m; ng += m; nb += m

    result = arr.copy()
    result[:,:,0][mask] = np.clip(nr*255, 0, 255)
    result[:,:,1][mask] = np.clip(ng*255, 0, 255)
    result[:,:,2][mask] = np.clip(nb*255, 0, 255)
    Image.fromarray(result.astype(np.uint8)).save(output_path)

for part in ['head','torso','upper_arm_front','forearm_front','upper_arm_back','forearm_back','leg_front','leg_back','full']:
    hue_shift_blue_to_red(f'sprites/robot_{part}_blue.png', f'sprites/robot_{part}_red.png')
```

Key: only render blue from Blender. Red is always derived from blue. This keeps geometry identical so the same punch pivot points work for both robots.

## Punch Animation

Joint-based rotation using nested CSS pivot divs. Values tuned in `playgrounds/punch.html`:

- **Shoulder pivot**: 52.1% 23.2% (transform-origin), punch angle: 90°
- **Elbow pivot**: 53.9% 39.4% (transform-origin), punch angle: -63°
- **Timing**: jab 210ms, hold 400ms, retract 200ms

The shoulder-pivot wraps the forearm sprite + the elbow-pivot. The elbow-pivot wraps the upper-arm sprite (the extending piece). This means the shoulder swings the whole arm, and the elbow extends the flat arm piece forward.

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
