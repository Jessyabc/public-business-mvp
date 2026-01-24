# Public Business

**Your ideas deserve a stage.**

A living map of ideas where curiosity meets collaboration. Share your thoughts, watch them evolve through collaboration, and build something meaningful together.

🌐 **Live**: [public-business.ca](https://www.public-business.ca/)

## What is Public Business?

Public Business is a collaborative platform that transforms how people share and develop ideas. It features:

- **Individual Workspace (Pillar #1)**: A private cognitive sanctuary for capturing and organizing your thoughts using a neumorphic, distraction-free interface
- **Discussion Forums**: Watch ideas evolve in real-time through collaborative discussions
- **Business & Public Modes**: Switch between a professional light theme and an immersive dark space-inspired theme
- **Organization Management**: Create and manage business organizations with member invitations
- **Transparent Collaboration**: Foster innovation through open dialogue and idea sharing

## Features

### For Individuals
- 📝 Private workspace for capturing thoughts and ideas
- 🎨 Beautiful neumorphic design with gentle animations
- 🌙 Dark mode (Public) and light mode (Business) themes
- 💾 Auto-sync with cloud storage

### For Organizations
- 🏢 Create and manage business profiles
- 👥 Invite team members via secure links
- 📊 Business insights and analytics
- 🔒 Role-based access control

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand, TanStack Query
- **Backend**: Supabase (Auth, Database, Real-time)
- **Routing**: React Router v6 (with lazy loading)

## Getting Started

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Jessyabc/public-business-mvp.git

# Navigate to project directory
cd public-business-mvp

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Deployment

- Run `npm run build` for production builds.
- Serve the generated `dist/` directory as the site root (do **not** serve the repository root).
- Ensure your host rewrites all non-asset routes to `dist/index.html` so React Router routes resolve.
- Serving the repo root `index.html` in production will leave `/src/main.tsx` unresolved because it expects the Vite build output in `dist/`.

The included `netlify.toml` encodes the build command, output folder, and SPA rewrite rules for Netlify deployments.

## Project Structure

```
src/
├── app/            # App configuration (router, helpers)
├── components/     # Reusable UI components
│   ├── auth/       # Authentication components
│   ├── brainstorm/ # Brainstorm/discussion components
│   ├── business/   # Business-specific components
│   ├── layout/     # Layout components (Header, Footer, etc.)
│   ├── navigation/ # Navigation components
│   └── ui/         # Base UI components (shadcn/ui)
├── contexts/       # React contexts (Auth, Theme)
├── features/       # Feature modules
│   ├── orgs/       # Organization management
│   └── workspace/  # Individual workspace (Pillar #1)
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations
├── lib/            # Utility functions
├── pages/          # Page components
├── services/       # API services
├── stores/         # Zustand stores
├── styles/         # Global styles and theme
└── types/          # TypeScript type definitions
```

## Design Philosophy

Public Business follows a **dual-pillar architecture**:

1. **Pillar #1 - Individual Workspace**: A private, neumorphic-styled space for personal thought capture and organization
2. **Pillar #2 - Collaborative Discussion**: A social layer where ideas can be shared and evolved with others

The app uses a **mode-aware theming system**:
- **Public Mode**: Dark, space-inspired theme with glass effects
- **Business Mode**: Light, professional neumorphic design

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is private and proprietary.

---

Built with ❤️ for idea explorers and collaborative thinkers.
