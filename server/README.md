# Sheepshead Server

Some Commands

```bash
brew services start postgresql
psql postgres
\conninfo
\l
CREATE DATABASE sheepshead;
\c sheepshead
\! clear
brew services stop postgresql

npx prisma db pull
npx prisma migrate dev --name init

npx ts-node src/index.ts
```
