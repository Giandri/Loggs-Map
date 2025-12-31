declare module "@prisma/internals" {
  // Minimal typing just to satisfy TypeScript for Prisma config
  export function defineConfig(config: Record<string, any>): any;
}

