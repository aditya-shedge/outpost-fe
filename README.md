# Outpost Frontend

A private directory for T-Hub startup founders to discover grants, challenges, and mentors.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Fonts:** DM Sans, Manrope, IBM Plex Mono

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running at `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Home page
│   └── globals.css        # Design tokens + base styles
├── components/
│   ├── layout/            # Layout components (Header, Footer)
│   └── ui/                # Reusable UI components
└── lib/
    └── utils.ts           # Utility functions (cn helper)
```

## Design System

The design follows a "field-notes editorial" aesthetic:

- **Colors:** Warm cream backgrounds, gold accents, ink text
- **Typography:** DM Sans (body), Manrope (headings), IBM Plex Mono (labels)
- **Style:** Sharp corners, minimal shadows, generous whitespace

See `docs/STYLE_GUIDE.md` for full design tokens.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Related

- [Backend API](../outpost-aditya) - Spring Boot REST API
- [API Reference](../outpost-aditya/docs/API_REFERENCE.md)
