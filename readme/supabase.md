# Supabase CLI Setup and Migration Commands

## 1) Open the project

```bash
cd /Users/svenvanlaar/Documents/GitHub/finfit-ui
```

## 2) Install Supabase CLI (macOS/Homebrew)

```bash
brew install supabase/tap/supabase
supabase --version
```

## 3) Authenticate and link the Supabase project

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

## 4) Apply migrations

```bash
supabase db push
```

## 5) Optional checks

```bash
supabase migration list
```

## Alternative: Use npx instead of Homebrew

```bash
npx supabase --version
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```
