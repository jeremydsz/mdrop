# MDrop

A zero-friction markdown viewer where you paste, drop, or type markdown and get a shareable link in one click.

## Features

- **Create notes** - Paste, drop a `.md` file, or type markdown directly
- **Live preview** - See your rendered markdown as you type
- **Shareable links** - One-click copy for instant sharing
- **Tags** - Lightweight organization without folders
- **Comments** - Simple discussion on notes
- **Beautiful typography** - Clean, distraction-free reading experience

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS v4
- **Backend**: Supabase (Postgres + Auth + RLS)
- **UI Components**: shadcn/ui + Radix UI
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **Animation**: Motion (Framer Motion)
- **Fonts**: Geist Sans + Geist Mono
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/your-org/mdrop.git
cd mdrop
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migrations in `supabase/migrations/` in the SQL Editor
   - Enable Google OAuth provider
   - Add redirect URL: `http://localhost:3000/auth/callback`

4. Copy environment variables:

```bash
cp .env.local.example .env.local
```

5. Update `.env.local` with your Supabase credentials

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Supabase Configuration for Production

1. Update Authentication > URL Configuration:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

2. Update Google OAuth redirect URI in Google Cloud Console

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Dashboard / Landing
│   ├── login/              # Login page
│   ├── new/                # Create note
│   ├── n/[id]/             # Read view
│   └── n/[id]/edit/        # Edit note
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── editor/             # Editor components
│   └── ...                 # Feature components
├── lib/                    # Utilities
│   ├── supabase/           # Supabase clients
│   ├── auth.ts             # Auth helpers
│   └── motion.ts           # Animation presets
└── types/                  # TypeScript types
```

## Design Philosophy

MDrop follows **subtractive design** principles:

- Content is the interface
- Silence over noise
- One obvious path
- Motion with purpose
- Typography as architecture

See [design-philosophy.md](docs/design-philosophy.md) for the full design system documentation.

## License

MIT
