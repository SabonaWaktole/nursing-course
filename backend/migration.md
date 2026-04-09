# Remote Database Migration Workflow

Because local development uses **PostgreSQL** and the remote production environment on Hostinger uses **MySQL**, Prisma migration history (`prisma migrate dev` and `prisma migrate deploy`) is incompatible across environments. 

To properly generate the schema and push it to the remote database whenever you change your Prisma models, you must follow this exact workflow:

### Step 1: Update your models
Add or modify your models in `backend/prisma/schema.prisma` as needed while the provider is set to `postgresql`.

### Step 2: Update your Local Database
Sync your changes to your local PostgreSQL database so your dev environment is up to date. *(We use `--skip-generate` here to bypass `EPERM` file-lock errors if your `npm run dev` server is actively running in the background).*
```bash
npx prisma db push --skip-generate
```

### Step 3: Switch to the MySQL Provider
Edit `backend/prisma/schema.prisma` and change the database provider to `mysql` so Prisma knows to format the queries for Hostinger:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Step 4: Push to the Remote Database
Use `dotenv-cli` to explicitly load your production variables and push the schema to the remote database. *(`db push` compares the schema against the actual database and safely adds missing columns without needing a migration history folder. The `--skip-generate` flag is used again because we don't want MySQL client bindings overwriting our local Postgres bindings).*
```bash
npx dotenv-cli -e .env.production -- npx prisma db push --skip-generate
```

### Step 5: Switch back to PostgreSQL
Revert your `backend/prisma/schema.prisma` back to `postgresql` so your local development doesn't break:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 6: Regenerate the Prisma Client
Regenerate your local Prisma Client so your Node.js code recognizes the newly added schema fields and runs with PostgreSQL bindings:
```bash
npx prisma generate
```
