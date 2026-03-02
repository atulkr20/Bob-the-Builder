# Bob the Builder Frontend

A modern, pixel-perfect replica of the Bob the Builder homepage built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Features

✨ **Modern Design**
- Dark theme with orange, amber, and lime gradients
- Smooth animations powered by Framer Motion
- Responsive layout (mobile, tablet, desktop)
- Beautiful component library with Lucide icons

🎯 **Pages**
- **Homepage** (`/`) - Main landing page with hero, features, how-it-works, demo, use cases, and CTA sections
- **Auth Page** (`/auth`) - Sign up / login with split layout, animated terminal, and form states
- **Room Page** (`/room/[slug]`) - Chat interface for interactive demos

🛠️ **Tech Stack**
- Next.js 15+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Date-fns for date formatting

## Installation

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to see the result.

## Development

The project uses the following folder structure:

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   ├── auth/
│   │   └── page.tsx        # Auth page
│   └── room/
│       └── [slug]/
│           └── page.tsx    # Chat room page
├── lib/
│   └── utils.ts           # Utility functions
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.mjs
```

## Customization

### Colors
Update the gradient colors in components by modifying these hex values:
- Orange Primary: `#f97316`
- Amber Secondary: `#eab308`
- Lime Accent: `#84cc16`
- Dark Background: `#080808`

### Fonts
Fonts are configured in `app/layout.tsx`:
- **Inter** - Body text
- **Space Grotesk** - Headings

### Animations
Framer Motion animations are configured inline in each component with:
- `initial` - Starting state
- `animate` - Final state
- `transition` - Animation timing

## Build

```bash
npm run build
npm start
```

## Integration

To connect with the backend API:

1. Update API endpoints in environment variables (`.env.local`)
2. Modify fetch calls in components to point to your backend
3. Connect auth flow with your API authentication

## License

MIT
