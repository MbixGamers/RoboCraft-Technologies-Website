# Modern UX/UI Landing Page

## Overview
A modern, responsive landing page built with React, Vite, and Tailwind CSS. This project showcases a clean UI/UX design with various sections including hero, features, pricing, testimonials, and footer components.

## Project Structure
- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite 7
- **Icons**: Lucide React
- **Special Features**: React Compiler enabled for optimized performance

## Key Technologies
- React 19.1.1
- Vite 7.1.7
- Tailwind CSS 4.1.16
- React Syntax Highlighter
- Babel React Compiler Plugin

## Development Setup
The project is configured to run on port 5000 with host 0.0.0.0 to work with Replit's proxy system.

### Commands
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Components
- **Navbar**: Navigation bar with scroll effect
- **Hero**: Main hero section
- **Features**: Feature showcase section
- **Pricing**: Pricing plans section
- **Testimonials**: Customer testimonials
- **Footer**: Site footer

## Recent Changes
- **2025-11-03**: Initial Replit import setup
  - Configured Vite to bind to 0.0.0.0:5000
  - Added allowedHosts: true for Replit proxy compatibility
  - Set up development workflow
  - Created project documentation

## Configuration
The Vite config has been updated to support Replit's environment:
- Server runs on 0.0.0.0:5000
- allowedHosts is set to true to bypass host header verification
- Preview mode also configured for port 5000
