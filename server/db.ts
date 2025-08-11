import * as schema from "@shared/schema";

// For VS Code development, use in-memory storage instead of database
// This will allow the admin portal to work without database connectivity issues
console.log("Using in-memory storage for VS Code development environment");

// Create a mock database object that matches the expected interface
export const db = null;
export const pool = null;
