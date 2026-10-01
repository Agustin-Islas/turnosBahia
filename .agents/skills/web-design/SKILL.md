---
name: web-design
description: >-
  Use this skill whenever you are asked to design, build, or clone web interfaces, landing pages, or web apps. It provides strict guidelines for modern aesthetics, UI/UX best practices, responsive design, and dynamic animations — customized for the Consultorio Odontológico Juliana Flaherti landing page project.
---

# Web Design & UI/UX Guidelines — Consultorio Flaherti

As an expert frontend engineer and UI/UX designer, follow these comprehensive guidelines whenever you generate or modify web interfaces for this dental practice landing page. This skill is tailored specifically for **Od. Juliana Flaherti's dental clinic in Bahía Blanca**.

---

## 1. Brand Identity & Visual Language

### Color Palette (MANDATORY — derived from client's real branding)
```css
:root {
  /* Primary — Warm Gold (logo, CTAs, accents) */
  --color-primary: #F5A623;
  --color-primary-light: #FBC96E;
  --color-primary-dark: #D4891A;

  /* Secondary — Teal/Turquoise (decorative elements, badges) */
  --color-secondary: #5BC5C2;
  --color-secondary-light: #A3E4E2;
  --color-secondary-dark: #3BA8A5;

  /* WhatsApp CTA — Green */
  --color-whatsapp: #25D366;
  --color-whatsapp-hover: #1DAF54;

  /* Backgrounds */
  --bg-primary: #FAFAF7;
  --bg-section-alt: #F5F0EB;
  --bg-card: #FFFFFF;

  /* Text */
  --text-primary: #2D2D2D;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  /* Borders & Shadows */
  --border-light: rgba(0, 0, 0, 0.06);
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.1);
}
```

### Typography
- **Headings:** `'Playfair Display'` or `'DM Serif Display'` — serif, elegant yet approachable
- **Body:** `'Plus Jakarta Sans'` or `'Inter'` — clean sans-serif, excellent readability
- **Hierarchy:** H1 (48-56px) → H2 (36-42px) → H3 (24-28px) → Body (16-18px) → Small (14px)
- **Font weights:** 700 for headings, 600 for subheadings, 400 for body, 500 for CTAs

### Design Personality
- **Warm & Approachable** — NOT cold/clinical. The doctor's brand is friendly, personal, and close.
- **Rounded corners** on all cards, buttons, and containers (12-20px border-radius)
- **Soft shadows** — avoid hard or dark shadows
- **Sparkle/twinkle decorative elements** in teal (matching their Instagram aesthetic)
- **Photo-forward** — use real photos from the `/imagenes/` folder whenever possible

---

## 2. Modern Aesthetics & Visual Excellence

- **Avoid Defaults:** Never use generic colors (plain red, blue, green) or default browser fonts.
- **Glassmorphism (subtle):** Use `backdrop-filter: blur()` with semi-transparent white backgrounds for floating elements (navbar on scroll, WhatsApp button tooltip).
- **Gradients:** Subtle warm gradients for hero sections: `linear-gradient(135deg, #FAFAF7, #F5F0EB)`.
- **Decorative shapes:** Use CSS pseudo-elements for curved section dividers (wave SVGs) and soft blob backgrounds — matching the client's Instagram visual style.
- **Whitespace:** Generous padding and margins. Sections should breathe (80-120px vertical padding on desktop, 48-64px on mobile).

---

## 3. Dynamic & Interactive Design

- **Micro-interactions:** Hover states on all interactive elements — buttons scale up slightly (`transform: scale(1.03)`), cards lift (`translateY(-4px)`), links change color with smooth transitions.
- **Scroll animations:** Implement fade-up, slide-in-left/right entrance animations using Intersection Observer. Keep durations between 400ms-700ms with staggered delays on card grids.
- **WhatsApp button pulse:** Add a subtle CSS pulse animation to the floating WhatsApp button to draw attention.
- **Before/After slider:** Use a draggable comparison slider for before/after dental cases if images are available.
- **Counter animations:** Animate numbers (years of experience, patients attended, etc.) when they scroll into view.
- **Feedback:** Button press effects (slight scale down on `:active`), loading spinners where needed.

---

## 4. Responsive & Adaptive Layouts

- **Mobile-First (CRITICAL):** 80%+ of traffic comes from Instagram → most visitors will be on mobile. Design for 375px width first, then scale up.
- **Breakpoints:**
  - Mobile: 0 – 639px
  - Tablet: 640px – 1023px
  - Desktop: 1024px+
  - Large Desktop: 1280px+
- **Flexbox & Grid:** Use CSS Grid for service cards (auto-fill, minmax) and Flexbox for alignment.
- **Touch targets:** All buttons ≥ 48px height, links ≥ 44px touch area.
- **Sticky WhatsApp CTA:** On mobile, add a fixed bottom bar with "Sacar Turno" button always visible.
- **Navigation:** Hamburger menu on mobile → full nav on desktop. Smooth-scroll anchor links.

---

## 5. Conversion-Optimized Structure

Every section must have a clear path to the WhatsApp CTA. The primary conversion goal is **"patient sends WhatsApp message to book an appointment"**.

### CTA Strategy:
1. **Hero:** Primary CTA button → WhatsApp with generic message
2. **Services:** Each service card has a secondary CTA → WhatsApp with service-specific message (e.g., "Hola! Quiero consultar por blanqueamiento dental")
3. **Before/After:** "¿Querés resultados así? Consultanos" → WhatsApp
4. **FAQ:** Last FAQ item: "¿Cómo saco turno?" → WhatsApp link
5. **Footer:** WhatsApp number + link
6. **Floating button:** Always visible → generic WhatsApp message

### WhatsApp Link Format:
```
https://wa.me/5492915661882?text=MENSAJE_PRELLENADO
```

---

## 6. Implementation Workflow

When building or modifying the landing page:

1. **Analyze & Plan:** Reference `guia de implementacion.md` for business data, services, colors, and structure.
2. **Design System First:** Create `index.css` with all CSS custom properties (colors, fonts, spacing, shadows), utility classes, and responsive breakpoints.
3. **Semantic HTML:** Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. Each section gets a descriptive `id` for anchor navigation.
4. **Component-Based:** Even in vanilla HTML, clearly comment each component block (e.g., `<!-- Hero Section -->`, `<!-- Services Grid -->`).
5. **Progressive Enhancement:** Core content works without JS. Animations and interactions are additive.
6. **Polish:** Review for accessibility (contrast ≥ 4.5:1, ARIA labels, alt text on all images), performance (lazy-load images below fold, optimize asset sizes).

---

## 7. SEO & Accessibility Best Practices

- **Title tag:** "Od. Juliana Flaherti | Odontóloga en Bahía Blanca — Niños y Adultos"
- **Meta description:** Include key services + location + WhatsApp CTA
- **Single `<h1>`** per page — the hero headline
- **Schema.org** structured data for `DentistOffice` (LocalBusiness)
- **Alt text** on all images (descriptive, include "odontóloga Bahía Blanca" naturally)
- **`aria-label`** for icon-only buttons (WhatsApp icon, social links)
- **High contrast** ratios for text (WCAG AA minimum)
- **Semantic HTML5** elements instead of `<div>` soup
- **Open Graph tags** for social sharing (Instagram link sharing)

---

## 8. Performance Requirements

- **Lighthouse scores:** 90+ across all categories
- **Images:** WebP format preferred, lazy loading (`loading="lazy"`), responsive `srcset`
- **Fonts:** `font-display: swap`, preload critical font files
- **CSS:** Inline critical CSS in `<head>`, defer non-critical styles
- **No heavy frameworks** — vanilla HTML/CSS/JS only, unless explicitly requested
- **Minification** for production build

---

## 9. Assets Reference

All real images and media are stored in `/imagenes/` within the project root:
- Professional photos of Od. Juliana Flaherti
- Before/after treatment photos (ortopedia, blanqueamiento)
- Logo and brand elements (on posts)
- Business hours graphic
- Appointment booking graphic
- FAQ story screenshots
- Video content (ortopedia maxilar, chequeo anual)

**Rule:** Always use real client assets over stock photos or placeholders when available.
