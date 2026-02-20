# OrangeScript — Smart Rx Pad

Digital prescription writing tool for Indian clinics. Built with React + Vite + Supabase.

## Setup

```bash
npm install
cp .env.example .env    # then fill in your Supabase keys
npm run dev
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste contents of `supabase/migration.sql` → Run
3. Go to Settings → API → copy **Project URL** and **anon/public key**
4. Paste into your `.env` file

## Deploy

Push to GitHub → connect to [Vercel](https://vercel.com) → add env vars → auto-deploys.
