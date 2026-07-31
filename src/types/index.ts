/**
 * Public barrel — the only thing feature modules and components should import.
 * Keeps the type surface small and prevents accidental imports of internal
 * backend-specific shapes.
 */
export * from "./api";
export * from "./domain";
