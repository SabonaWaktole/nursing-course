# Archived PostgreSQL migrations

These four migrations are **historical and must not be run**.

They were written for PostgreSQL (`provider = "postgresql"`), but production is
**MariaDB 11.8** on Hostinger (`mysql://…@srv1851.hstgr.io:3306`). They contain
Postgres-flavoured DDL — double-quoted identifiers, Postgres type names — that
MariaDB will reject.

They were also never applied to production. The production database has **no
`_prisma_migrations` table**: it was created with `prisma db push`, not
`prisma migrate`. So there is no history for these to be part of.

They are kept only so the Postgres-era schema evolution is not lost.

## How this project actually manages schema

`prisma db push` (or a hand-written migration applied with `prisma db execute`),
because production has no migration history to append to.

To apply a schema change to production:

```bash
cd backend
DATABASE_URL="<from .env.production>" npx prisma db execute \
  --file prisma/migrations/<name>/migration.sql \
  --schema prisma/schema.prisma
```

Then confirm there is no drift:

```bash
DATABASE_URL="<…>" npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma
# expected output: "No difference detected."
```

## If you ever want real migration history

Baseline the existing database instead of replaying these:

```bash
npx prisma migrate resolve --applied <migration_name>
```
