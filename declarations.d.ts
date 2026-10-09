// Global ambient declarations for Taskly

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_BASE_URL?: string;
    GO_BACKEND_URL?: string;
    DATABASE_URL?: string;
    NODE_ENV?: "development" | "production" | "test";
  }
}
