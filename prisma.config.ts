import { defineConfig } from '@prisma/internals'

export default defineConfig({
  schema: './prisma/schema.prisma',
  db: {
    directUrl: process.env.DATABASE_URL!,
  },
})
