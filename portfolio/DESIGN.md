---
name: Safagix Dev Portfolio
colors:
  primary: "#10b981" # Emerald 500 (Brand Accent, Buttons, active states)
  secondary: "#f59e0b" # Amber 500 (Used in decorative background gradient glow)
  background: "#050505" # Dark canvas background
  surface: "rgba(255, 255, 255, 0.02)" # Inner cards surface (2% white opacity)
  surface-border: "rgba(255, 255, 255, 0.08)" # Input & Toggle border (8% white opacity)
  surface-outer: "rgba(255, 255, 255, 0.03)" # Outer cards background (3% white opacity)
  surface-outer-ring: "rgba(255, 255, 255, 0.06)" # Outer card border/ring (6% white opacity)
  text-primary: "#f1f5f9" # Slate 100 (Primary text, body titles)
  text-secondary: "#94a3b8" # Slate 400 (Supporting text, paragraphs)
  text-muted: "#475569" # Slate 600 (Meta tags, labels, copyright)
  text-accent: "#34d399" # Emerald 400 (Badges, accents, highlights)
  selection-bg: "rgba(16, 185, 129, 0.3)" # Selection background (emerald with 30% alpha)
  selection-text: "#ffffff" # Selection text color
typography:
  display:
    fontFamily: '"Cabinet Grotesk", "Clash Display", sans-serif'
    fontWeight: 600
  body:
    fontFamily: '"Geist", "Satoshi", sans-serif'
    fontWeight: 400
  mono:
    fontFamily: '"JetBrains Mono", monospace'
    fontWeight: 400
rounded:
  full: "9999px"
  card-outer: "32px" # 2rem (Outer card container)
  card-inner: "26px" # calc(2rem - 0.375rem) (Inner cards content border-radius)
  input: "16px" # 1rem / rounded-2xl (Form fields and social buttons)
  chip: "9999px" # rounded-full
  snippet: "12px" # 0.75rem / rounded-xl (Prompt code block snippets)
---

# Design System

## Overview
A hyper-premium, dark, developer-focused portfolio designed with high information density, sleek micro-animations, three-dimensional elements, and modern typography. It uses a structured nested-border layout pattern ("glassmorphism" look) to achieve a modern interface.

---

## 1. Global Setup & Ambient Foundations

### 1.1 Canvas & Ambient Styling
- **Page Canvas Background**: `#050505` (Solid pure dark gray-black).
- **Base Text Color**: `#f1f5f9` (Slate 100).
- **Text Selection**:
  - Background: `rgba(16, 185, 129, 0.3)` (Emerald 500 at 30% opacity).
  - Text Color: `#ffffff`.
- **Custom Scrollbars**:
  - Size: `thin` width.
  - Track: `transparent`.
  - Handle: `rgba(255, 255, 255, 0.08)` (Subtle white).

### 1.2 Ambient Background Layers (Glassmorphism Orbs)
Two fixed blur orbs provide ambient color depth to the dark canvas:
- **Orb 1 (Emerald Glow)**:
  - Width: `60vw` / Height: `60vw`
  - Position: `fixed`, Left `20vw`, Top `30vh`, Z-index `0`.
  - Style: `radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)` with a `blur(80px)`.
  - Pointer events: Disabled (`pointer-events: none`).
- **Orb 2 (Amber Glow)**:
  - Width: `50vw` / Height: `50vw`
  - Position: `fixed`, Right `10vw`, Bottom `20vh`, Z-index `0`.
  - Style: `radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, transparent 70%)` with a `blur(80px)`.
  - Pointer events: Disabled (`pointer-events: none`).
- **Noise Texture Overlay**:
  - Position: `fixed`, covers entire viewport (`inset: 0`), Z-index `50`.
  - Background image: Repeating fractal noise SVG (`opacity: 0.025`).
  - Pointer events: Disabled (`pointer-events: none`).

*Note: On devices with `prefers-reduced-motion: reduce`, the noise overlay, orb-1, and orb-2 are completely hidden/disabled.*

---

## 2. Typography

The design utilizes a strict font-pairing hierarchy:

| Hierarchy Role | Font Family | Tailwind Class | Sizes & Line Heights (Mobile → Desktop) | Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | display (Cabinet Grotesk / Clash Display) | `text-4xl md:text-6xl tracking-tighter leading-[0.9]` | 36px → 60px / Line-Height: 0.9 / Letter-Spacing: -0.05em | Semibold (600) |
| **Section Title** | display (Cabinet Grotesk / Clash Display) | `text-3xl md:text-5xl tracking-tight leading-[0.95]` | 30px → 48px / Line-Height: 0.95 / Letter-Spacing: -0.025em | Semibold (600) |
| **Project Title** | display (Cabinet Grotesk / Clash Display) | `text-2xl tracking-tight` | 24px / Letter-Spacing: -0.025em | Semibold (600) |
| **Card Title** | display (Cabinet Grotesk / Clash Display) | `text-xl font-semibold tracking-tight` | 20px / Letter-Spacing: -0.025em | Semibold (600) |
| **Stat Counter** | display (Cabinet Grotesk / Clash Display) | `text-5xl font-semibold tracking-tighter` | 48px / Letter-Spacing: -0.05em | Semibold (600) |
| **Paragraph Text** | body (Geist / Satoshi) | `text-base leading-relaxed` | 16px / Line-Height: 1.625 | Regular (400) |
| **Card Body** | body (Geist / Satoshi) | `text-sm leading-relaxed` | 14px / Line-Height: 1.625 | Regular (400) |
| **Buttons / Links** | body (Geist / Satoshi) | `text-sm font-semibold` | 14px | Semibold (600) |
| **Subheadings/Meta**| body (Geist / Satoshi) | `text-xs` | 12px | Regular (400) |
| **Section Eyebrows**| body (Geist / Satoshi) | `text-[10px] font-medium uppercase tracking-[0.2em]` | 10px / Uppercase / Letter-Spacing: 0.2em | Medium (500) |
| **Code Snippets** | mono (JetBrains Mono) | `text-sm leading-relaxed` | 14px / Line-Height: 1.625 | Regular (400) |

---

## 3. Structural Layout & Grid Systems

### 3.1 Page Section Container (`Section.tsx`)
All main pages inherit a standard layout grid structure:
- **Z-Index Position**: `relative z-10` (Renders above background blur glows).
- **Spacings**:
  - Vertical Section Padding: `py-24` (96px) on mobile, scaling to `py-32` (128px) on desktop (`md:py-32`).
  - Max Width Container: `max-w-7xl` (1280px) centered via `mx-auto`.
  - Horizontal Outer Padding: `px-4` (16px) on mobile, `px-8` (32px) on desktop (`md:px-8`).
- **Inner Header Spacings**:
  - Space between **Section Eyebrow** and **Section Headline**: `mt-4` (16px).
  - Space between **Section Headline** and **Children Content**: `mt-12` (48px).

---

## 4. Design Components & UI Atoms

### 4.1 Double-Border Card Design (Layout Container)
The core surface element across the site is the nested double-border container which mimics high-end glassmorphism.

#### Outer Container Wrapper
- **Background**: `bg-white/[0.03]` (White at 3% opacity).
- **Borders**: `ring-1 ring-white/[0.06]` (1px wide white outline at 6% opacity).
- **Border Radius**: `rounded-[2rem]` (32px).
- **Inner Padding**: `p-1.5` (6px spacing, acting as a visual offset/inset frame for the inner card).

#### Inner Container Content Card
- **Background**: `bg-white/[0.02]` (White at 2% opacity).
- **Effects**: `backdrop-blur-2xl` (Heavy background blur).
- **Border Highlights**: `shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]` (1px white top inner highlight).
- **Border Radius**: `rounded-[calc(2rem-0.375rem)]` (26px).
- **Internal Padding Variations**:
  - Standard cards (About, Projects, Notes): `p-8` (32px padding on all sides).
  - Stack Category cards: `px-8 py-6` (32px horizontal, 24px vertical).

---

### 4.2 Language Toggle Navbar (`LangToggle.tsx`)
A fixed navigation bar floating on the top right to control internationalization.

- **Placement**: `fixed top-4 right-4 z-40` (Fixed position, 16px from top/right, floating above all layers).
- **Main Bar Wrapper**:
  - Background: `bg-white/[0.04]` (White at 4% opacity).
  - Borders: `border border-white/[0.08]` (1px white border at 8% opacity).
  - Effects: `backdrop-blur-xl` (Heavy backdrop blur).
  - Border Radius: Full (rounded-full).
  - Padding: `p-1` (4px).
  - Gap: `gap-0.5` (2px space between buttons).
- **Toggle Buttons**:
  - Typography: `text-xs font-medium` (12px, medium weight).
  - Sizes: `min-width: 40px` / `min-height: 32px`.
  - Inner Padding: `px-3 py-1.5` (12px horizontal, 6px vertical).
  - Hover & Active Indicator:
    - Active background indicator: `bg-white/[0.08]` (White at 8% opacity), `rounded-full`. Animates smoothly with `spring` dynamics (stiffness: 300, damping: 24).
    - Active label: `text-white`.
    - Inactive labels: `text-slate-500 hover:text-slate-300` (Smooth transition over 200ms).
  - Focus Ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50`.

---

### 4.3 Primary Call-To-Action Button (CTA)
Used for the main Hero CTA and the Form Submission button.

- **Layout**: `inline-flex items-center gap-2 self-start` (Row alignment, 8px gap, aligns to left/start of its container).
- **Background**: `bg-emerald-500` (`#10b981`).
- **Border Radius**: Full (rounded-full).
- **Padding**: `px-6 py-3` (24px horizontal, 12px vertical).
- **Typography**: `text-sm font-semibold text-black` (14px, semibold weight, black color).
- **States & Hover Micro-Animations**:
  - Hover: `hover:scale-[0.98]` (Scales down 2%).
  - Active: `active:scale-[0.97]` (Scales down 3%).
  - Disabled (Loading/Success): `disabled:opacity-50 disabled:cursor-not-allowed`.
  - Focus Indicator: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]`.
- **Inner Arrow Icon Circle**:
  - Wrapper: `inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/15` (28px * 28px circle, background black at 15% opacity).
  - Interaction: `transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-px` (Translates 2px right, 1px up on parent hover).
  - SVG Specs: `width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"` (Arrow pointing top-right).
- **Loading State**:
  - Text changes to "Enviando..." (Or translated counterpart).
  - Spinner: `h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent` (16px * 16px circular rotating spinner).

---

### 4.4 Inputs & Form Fields (`ContactSection.tsx`)
Custom fields tailored for the contact form layout.

- **Class Definition**:
  - Background: `bg-white/[0.04]` (White at 4% opacity).
  - Borders: `border border-white/[0.08]` (1px white at 8% opacity).
  - Border Radius: `rounded-2xl` (16px).
  - Padding: `px-5 py-3` (20px horizontal, 12px vertical).
  - Typography: `text-sm text-white` (14px).
  - Placeholder: `placeholder:text-slate-600` (Dark gray-slate).
  - Transition duration: `duration-200 transition-colors`.
- **Focus States**:
  - Border: `focus:border-emerald-400/40` (Changes to emerald with 40% opacity).
  - Ring Highlight: `focus:ring-1 focus:ring-emerald-400/20` (1px emerald shadow rings).
  - Outline: `focus:outline-none` (Browser defaults removed).
- **Textarea-Specific**:
  - Dimensions: `min-h-[120px]` and vertical resizing only (`resize-y`).
  - Row Span: `rows={4}`.

---

### 4.5 Social Link Cards (`ContactSection.tsx`)
Interactive links mapped inside the Contact section.

- **Layout**: `flex items-center gap-3` (Row, 12px gap).
- **Dimensions**: `min-height: 48px`.
- **Background**: `bg-white/[0.02]` (White at 2% opacity).
- **Borders**: `border border-white/[0.06]` (1px white at 6% opacity).
- **Border Radius**: `rounded-2xl` (16px).
- **Padding**: `px-5 py-4` (20px horizontal, 16px vertical).
- **Typography**: `text-sm text-slate-300` (14px).
- **SVG Icon size**: `width="18" height="18" stroke-width="1.5"`.
- **Interaction Hover States**:
  - Border: `hover:border-white/[0.12]` (Becomes white at 12% opacity).
  - Background: `hover:bg-white/[0.04]` (Becomes white at 4% opacity).
  - Animation Curve: `transition-all duration-300 ease-out`.
  - Focus Ring: `focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:outline-none`.

---

### 4.6 Chips, Badges & Small Labels

#### 4.6.1 Section Eyebrows
- **Structure**: `inline-block rounded-full px-3 py-1 font-medium`
- **Typography**: `text-[10px] uppercase tracking-[0.2em]` (10px, uppercase, 0.2em spacing).
- **Colors**: `text-emerald-400` (No background, no border).
- **Inner Padding**: `px-3 py-1` (12px horizontal, 4px vertical).

#### 4.6.2 Category Tech Tags (`StackSection.tsx`)
- **Structure**: `rounded-full border px-3 py-1`
- **Background**: `bg-white/[0.04]` (4% opacity white).
- **Borders**: `border-white/[0.08]` (1px white at 8% opacity).
- **Typography**: `text-xs text-slate-300` (12px).
- **Inner Padding**: `px-3 py-1` (12px horizontal, 4px vertical).

#### 4.6.3 Project Stack Tags (`ProjectsSection.tsx`)
- **Structure**: `rounded-full border px-2.5 py-1`
- **Background**: `bg-white/[0.04]` (4% opacity white).
- **Borders**: `border-white/[0.08]` (1px white at 8% opacity).
- **Typography**: `text-xs text-slate-400` (12px, slightly darker than Category tag text).
- **Inner Padding**: `px-2.5 py-1` (10px horizontal, 4px vertical).

---

## 5. Detailed Anatomy by Section

### 5.0 Global Shell
- **HTML Element**: `<html lang="es">` (Translates state wrapper).
- **Body Wrapper**: `min-h-screen bg-[#050505] text-slate-100 antialiased`.
- **Global Footer**:
  - Layout: Centered wrapper separated by a thin top border: `relative z-10 border-t border-white/[0.04] py-8 text-center`.
  - Border: 1px top border with white with 4% opacity.
  - Text: `text-xs text-slate-600` (12px).

---

### 5.1 Hero Section
The landing section combining high-density text and interactive 3D WebGL shader artwork.

```
+-------------------------------------------------------------------+
|  [SX Logo]                                                        |
|  NAME TITLE                       / \     WebGL Canvas            |
|  Role Badge                      | * |    Icosahedron Geometry    |
|  Description Paragraph            \ /     Particle Orbit Field    |
|  [CTA Button ->]                                                  |
+-------------------------------------------------------------------+
```

- **Layout Structure**:
  - Outer Wrapper: `relative min-h-[100dvh] w-full overflow-hidden bg-[#050505]` (Full screen height, overflow hidden).
  - Row Grid: `mx-auto flex max-w-7xl flex-col md:flex-row items-center gap-12 px-4 py-24 md:py-0 md:px-8` (Stacked vertically on mobile with 96px padding, side-by-side row on desktop with 32px horizontal padding, no vertical padding).
- **Left Column (Text Content)**:
  - Width: `w-full md:w-1/2` (Full on mobile, half on desktop).
  - Spacings: `flex flex-col items-start gap-6` (Vertical stack, 24px gaps).
  - Brand Logo Badge (`SX`):
    - Structure: `flex h-[88px] w-[88px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]` (88px * 88px circle).
    - Typography: `text-2xl font-semibold text-emerald-400` (Display font, 24px).
  - Name Title Heading:
    - Typography: `text-4xl md:text-6xl tracking-tighter leading-[0.9] text-white` (Display font).
  - Role Badge:
    - Structure & Typography: `rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-medium`.
  - Edge/Description Paragraph:
    - Typography: `max-w-[42ch] text-lg leading-relaxed text-slate-400` (42 characters limit, 18px size).
  - Main CTA Button: Pointer triggers scroll to `#projects` (Detailed in section 4.3).
- **Right Column (3D WebGL WebGL Canvas)**:
  - Outer Container: `relative h-[50vh] w-full md:h-screen md:w-1/2` (50% screen height on mobile, full screen height on desktop).
  - WebGL Renderer details:
    - Device Pixel Ratio capped at `Math.min(window.devicePixelRatio, 2)`.
    - Scene background: transparent (`alpha: true`).
    - Orbit Geometry: `THREE.IcosahedronGeometry(2, isMobile ? 2 : 4)`.
    - Custom Vertex Shader: Modifies geometry vertices dynamically:
      ```glsl
      pos.z += sin(pos.x * 3.0 + uTime) * 0.12;
      pos.y += cos(pos.z * 3.0 + uTime) * 0.12;
      ```
    - Custom Fragment Shader: Edge glow Fresnel blending:
      - Dark interior: `rgba(0.05, 0.12, 0.08)` (#0d1e14).
      - Bright exterior glow: `rgba(0.2, 0.65, 0.4)` (#33a666).
    - Particles Cloud Field:
      - Shape: `THREE.BufferGeometry` with randomly distributed points.
      - Density: 80 points on mobile, 400 points on desktop.
      - Material: `THREE.PointsMaterial` color `#10b981`, point size `0.02`, `opacity: 0.6`.
    - Animation Loop:
      - Icosahedron rotates dynamically on mouse movements (mouse coords tracked and smoothed via `useSpring` with stiffness 80, damping 20).
      - Particle system rotates slowly on Y-axis at a constant `0.0005` rad/frame.

---

### 5.2 About Section
Two columns describing skills and product design values.

- **Layout Structure**: `grid grid-cols-1 gap-8 md:grid-cols-12` (12 column grid on desktop, 32px gap).
- **Left Columns (Biography Text)**:
  - Column Width: `md:col-span-7` (7 out of 12 columns).
  - Spacings: `space-y-5` (20px vertical space between paragraphs).
  - Typography: `max-w-[65ch] text-base leading-relaxed text-slate-400` (16px size, Slate 400, line-height 1.625).
- **Right Columns (Core Diff Quote)**:
  - Column Width: `md:col-span-5` (5 out of 12 columns).
  - Frame Wrapper: Double-Border Card system (Detailed in section 4.1).
  - Inner card items:
    - Layout: `flex items-start gap-3` (Row, 12px gap).
    - Dot Highlight: `mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400` (8px green circle, offset by 4px from top).
    - Quote text: `text-sm leading-relaxed text-slate-300` (14px).

---

### 5.3 Stack Section
A responsive asymmetrical grid showcasing technical tools categorized by function.

```
Row 1: +---------------------+-----------------+-----------------------+
       | Languages (span-5)  | Frameworks (3)  | AI & Agents (span-4)  |
Row 2: +---------------------+-----------------+-----------------------+
       | Design (span-4)     | Automation & Infrastructure (span-8)    |
       +---------------------+-----------------------------------------+
```

- **Layout Structure**: `grid grid-cols-1 gap-4 md:grid-cols-12` (12 column grid on desktop, 16px gap).
- **Grid Spans Mappings**:
  - Languages card: `md:col-span-5`.
  - Frameworks card: `md:col-span-3`.
  - AI & Agents card: `md:col-span-4`.
  - Design card: `md:col-span-4`.
  - Automation & Infrastructure card: `md:col-span-8`.
- **Card Styling & Animations**:
  - Frame: Nested Double-Border Card design (Detailed in section 4.1, padding `px-8 py-6`).
  - Entrance Animation: Fade & slide up (`y: 16` to `y: 0`), blurred (`blur(4px)` to `blur(0)`), staggered by card index (`delay: index * 0.08`).
  - Hover Micro-Animation: Subtle glow shadow shift `boxShadow: "0 0 30px -8px rgba(16,185,129,0.06)"`.
- **Card Inner Content**:
  - Label: `text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400` (10px).
  - Chip List Grid: `mt-4 flex flex-wrap gap-2` (8px gap).
  - Tech tag chips: Detailed in section 4.6.2.

---

### 5.4 Projects Section
Overlapping card layers detailing prompts, code structure, and measurable production results.

- **Layout Structure**: `space-y-0` (No spacing on container to allow manual desktop overlaps).
- **Overlapping Card Stack**:
  - Cards stack on Z-axis: `relative z-${30 - index * 10}` (First card is at the top).
  - Negative margins: `index > 0 ? "md:-mt-8" : ""` (Starting from second card, cards overlap top neighbor by 32px on desktop).
  - Rotations: Organic tilted layout when in view: `rotate: ROTATIONS[index]` where `ROTATIONS = [-0.8, 1.2, -0.4]` degrees.
- **Card Inner Content Details**:
  - Title: `text-2xl tracking-tight text-white` (Display font, 24px).
  - Content Wrapper: `mt-6 space-y-5` (24px top spacing, 20px gaps).
  - Block 1: **Problem**
    - Header Label: `text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500` (10px).
    - Paragraph text: `mt-1 text-sm leading-relaxed text-slate-300` (14px).
  - Block 2: **Prompt**
    - Header Label: `text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500`.
    - Box snippet: `mt-1 overflow-x-auto rounded-xl bg-black/40 p-5` (Rounded 12px, 40% black background, 20px padding, custom horizontal scrollbar).
    - Typography: `text-sm leading-relaxed text-slate-300`, `font-family: var(--font-mono)` (JetBrains Mono).
  - Block 3: **Result**
    - Header Label: `text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500`.
    - Paragraph text: `mt-1 text-sm leading-relaxed text-emerald-400` (14px, Emerald highlights).
  - Tech chips row: `mt-6 flex flex-wrap gap-2` (Detailed in section 4.6.3).
  - Role text metadata: `mt-4 text-xs text-slate-600` (12px size, Slate 600).
- **Metrics Panel Footer**:
  - Layout: `mt-6 flex gap-6 border-t border-white/[0.06] pt-6` (1px white top border at 6% opacity, 24px vertical padding, 24px horizontal gaps).
  - Metric Columns (3 cols):
    - Layout: `text-center` (Centered contents).
    - Value: `block text-2xl font-semibold tracking-tighter text-white` (24px, display font, white).
    - Label: `text-[10px] uppercase tracking-[0.15em] text-slate-500` (10px).

---

### 5.5 Process Section
A timeline layout mapping creation steps.

```
   ( 1 )              ( 2 )              ( 3 )              ( 4 )
   Idea              Prompt             Iterate             Ship
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - > [Dotted line]
```

- **Layout Structure**:
  - Step Grid Row: `flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between` (Column on mobile, row on desktop, 32px gap).
- **Step Column**:
  - Width: `md:flex-1` (Divides columns evenly).
  - Layout: `flex flex-col items-center gap-3` (Centered column, 12px gap).
  - Number Badge:
    - Structure: `flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-400/20` (48px circle, emerald at 10% opacity, 1px ring line with 20% opacity).
    - Animation: Dynamic glow pulse loop when step is in view:
      ```css
      box-shadow: 0 0 0px rgba(16,185,129,0) -> 0 0 20px rgba(16,185,129,0.3) -> 0 0 0px rgba(16,185,129,0)
      ```
      (Loop duration: 2s, delayed by `index * 0.3s` to create a sequential ripple wave).
  - Text block:
    - Step Title: `text-sm font-semibold text-white` (14px).
    - Step Description: `mt-1 max-w-[20ch] text-xs leading-relaxed text-slate-500` (12px, 20 characters limit).
- **Connecting Vector Line (Desktop)**:
  - Element: `mt-6 hidden h-6 w-full md:block` (24px top spacing, height 24px).
  - Connection Dotted Line: SVG `<line>` linking badges.
    - Start point `x1 = index * 200 + 100`, End point `x2 = x1 + 200`.
    - Styling: `stroke="rgba(16,185,129,0.2)"`, `stroke-width="1"`, `stroke-dasharray="4 4"`.
    - Entrance Animation: Dotted lines draw from left to right sequentially when section is entered: `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}` (Duration: 1s, delay: `0.5 + index * 0.2` seconds).

---

### 5.6 Proof Section
A responsive grid showing counter statistics.

- **Layout Structure**: `grid grid-cols-2 gap-8 md:grid-cols-5` (2 columns on mobile, 5 columns on desktop, 32px gap).
- **Stat Columns**:
  - Layout: `flex flex-col items-start` (Align items left).
  - Entrance Animation: Slide & fade up (`initial={{ opacity: 0, y: 16 }}`, transition `0.5s` staggered with `0.1s` delay per column).
  - Counter Value:
    - Typography: `block text-5xl font-semibold tracking-tighter text-white` (Display font, 48px size).
    - Animation: Counts up from 0 to target value on viewport entrance (using `useSpring` with stiffness 80, damping 20). Returns static values if string contains a range (e.g. `3-7`). Appends `+` on numbers (e.g. `12` becomes `12+`).
  - Separator divider line:
    - Structure: `mt-4 h-px w-8 bg-emerald-500/30` (16px top padding, 1px height, 32px width, Emerald-500 at 30% opacity).
  - Stat Label:
    - Typography: `mt-2 text-xs uppercase tracking-[0.15em] text-slate-500` (8px top padding, 12px size, 0.15em tracking, Slate 500).

---

### 5.7 Notes Section
A grid showcasing essays and opinions.

- **Layout Structure**: `grid grid-cols-1 gap-4 md:grid-cols-12` (12 column grid on desktop, 16px gap).
- **Note Cards**:
  - Columns Span: `md:col-span-6` (Evenly split into 2 columns on desktop).
  - Outer Wrapper & Inner Card: Nested Double-Border Card design (Detailed in section 4.1, padding `p-8`).
  - Hover Micro-Animation: Card shifts up 2px and outline brightens:
    - Hover Action: `y: -2`, border color changes to `rgba(255,255,255,0.12)`.
    - Animation Curve: `transition-all duration-500 ease-out`.
  - Inner card content:
    - Card Title: `text-xl font-semibold tracking-tight text-white` (Display font, 20px).
    - Card Body: `mt-3 max-w-[65ch] text-sm leading-relaxed text-slate-400` (12px top padding, 14px size, Slate 400).

---

### 5.8 Contact Section
A dual-column section containing a contact message form and social link shortcuts.

- **Layout Structure**: `flex flex-col gap-12 md:flex-row` (Stacked column on mobile, row on desktop, 48px gap).
- **Left Column (Message Form)**:
  - Width: `w-full md:w-3/5` (Full on mobile, 60% on desktop).
  - Layout: `flex flex-col gap-5` (Vertical column, 20px gap).
  - Field Groups: `flex flex-col gap-1.5` (6px gap between label and input).
    - Label: `text-xs font-medium text-slate-400` (12px size, Slate 400).
    - Input Elements: Detailed in section 4.4.
  - Form Submit Button: Detailed in section 4.3.
  - Notification Messages:
    - Success block: `text-xs text-emerald-400` (12px, Emerald 400).
    - Error block: `text-xs text-red-400` (12px, Red 400).
    - Entry/Exit Animation: Slide & fade up (`initial={{ opacity: 0, y: -4 }}`) using `AnimatePresence` `mode="wait"`.
- **Right Column (Social Link Actions)**:
  - Width: `w-full md:w-2/5` (Full on mobile, 40% on desktop).
  - Layout: `flex flex-col gap-3` (Vertical column, 12px gap).
  - Social Links design: Detailed in section 4.5.
  - Link List Icons (SVG inline):
    - Email (Envelope): `rect width="20" height="16" x="2" y="4" rx="2"`, path envelope flap.
    - GitHub (Octocat outline): SVG paths drawing GitHub brand logo.
    - LinkedIn (LinkedIn block outline): SVG paths drawing LinkedIn brand logo.
