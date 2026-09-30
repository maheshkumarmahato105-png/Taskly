// Global ambient declarations for Taskly
// These fill in any gaps when node_modules types are not installed locally.

declare var process: {
  env: {
    [key: string]: string | undefined;
    NEXT_PUBLIC_API_BASE_URL?: string;
    NODE_ENV?: "development" | "production" | "test";
  };
};
