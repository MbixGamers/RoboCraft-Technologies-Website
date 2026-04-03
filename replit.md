# RoboCraft Technologies

## Overview
A personal electronics project showcase site built with React, Vite, and Tailwind CSS. Users can browse curated Arduino, ESP, and Raspberry Pi projects — each with circuit schematics, step-by-step guides, materials lists, and fully documented source code.

## Project Structure
- **Frontend**: React 19 + Vite + React Router DOM
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite 7
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

## Pages
- `/` — Home landing page (hero, features, platform overview, community)
- `/projects` — Project Explorer (folder-based browser by platform)

## Project Explorer Structure
```
Projects
├── Arduino
│   ├── Arduino UNO
│   ├── Arduino NANO
│   ├── Arduino Pro Mini
│   └── Arduino Mega
├── ESP
│   ├── ESP 8266
│   └── ESP 32
└── Raspberry Pi
    ├── Raspberry Pi 4/5
    ├── Raspberry Pi Zero
    └── Raspberry Pi Pico
```

## Key Files
- `src/App.jsx` — App root with BrowserRouter and routes
- `src/pages/ProjectsPage.jsx` — Projects explorer with collapsible folder UI
- `src/data/projects.js` — All project category/sub-category data (add new projects here)
- `src/data/CodeExamples.js` — Hero section code tab examples (Arduino/ESP code)
- `src/components/` — Navbar, Hero, Features, Pricing, Testimonials, Footer
- `public/robocraft-logo.png` — Brand logo (mix-blend-mode: screen in dark UI)

## Adding New Projects
To add a project, open `src/data/projects.js` and add an entry to the `projects` array of the relevant sub-category:
```js
{
  id: "unique-project-id",
  name: "My Project Name",
}
```
Then create a detail page/component as needed.

## Commands
- `npm run dev` — Start development server on port 5000
- `npm run build` — Build for production
- `npm run preview` — Preview production build

## Branding
- Name: RoboCraft Technologies
- Colors: Orange (#f97316), Green (#4ade80), Dark slate background
- Logo: `/public/robocraft-logo.png` — rendered with `mix-blend-mode: screen` to blend into dark UI
