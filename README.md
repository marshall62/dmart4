This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing API handlers against a local PostgreSQL database.

### Prerequisites

Tests require a local PostgreSQL instance. If you haven't set it up yet:

```bash
# Install PostgreSQL 16 via Homebrew
brew install postgresql@16

# Start the PostgreSQL service
brew services start postgresql@16

# Create the test database
/opt/homebrew/opt/postgresql@16/bin/createdb dmart_test

# Set up the schema and seed data
/opt/homebrew/opt/postgresql@16/bin/psql -d dmart_test -f scripts/setup-test-db.sql
/opt/homebrew/opt/postgresql@16/bin/psql -d dmart_test -f scripts/seed-test-data.sql
```

### Running Tests

```bash
npm test
```

### Managing PostgreSQL

**Check if PostgreSQL is running:**

```bash
brew services list | grep postgresql
```

**Start PostgreSQL:**

```bash
brew services start postgresql@16
```

**Stop PostgreSQL:**

```bash
brew services stop postgresql@16
```

**Verify database connection:**

```bash
/opt/homebrew/opt/postgresql@16/bin/psql -d dmart_test -c "SELECT COUNT(*) FROM artworks;"
```

**Note:** PostgreSQL must be running before executing tests. The tests do not automatically start the database service.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## USing Postgres locally

PgAdmin4 is being used to view data in the vercel database. It has a connection string of
hostname: ep-rough-paper-a4opslp9-pooler.us-east-1.aws.neon.tech
port: 5432
Maintenance db: verceldb
username: default

## Email from inquiries form

The contact form sends emails using Resend. The API key is stored in the RESEND_API_KEY environment variable.  To configure resend, go to https://resend.com/api-keys and create a new API key.   I logged into resend with my gmail account and created a new API key.   I also went to godaddy and configured the domain to use resend for email.  This should all be free.

## Testing

npm run test

To verify that postgres is running locally:
```bash
brew services list | grep postgresql 
```

If it's not running, start it with:
```bash
brew services start postgresql@16
```

Verify the test database exists:
```bash
/opt/homebrew/opt/postgresql@16/bin/psql -d dmart_test -c "SELECT COUNT(*) FROM artworks;"
```

The tests/setup.ts runs before all tests:
Executes setup-test-db.sql to create tables
Before each individual test:
Truncates all tables
Reseeds with data from seed-test-data.sql

Environment variables: The test uses POSTGRES_URL=postgresql://localhost:5432/dmart_test (set in vitest.config.ts), so no .env file needed for tests.


Update github PAT 1/16/27
