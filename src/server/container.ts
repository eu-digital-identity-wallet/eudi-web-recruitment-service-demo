import "server-only";
import "reflect-metadata";
import { Container as typediContainer } from "typedi";

// Use the global container so @Service() registrations are visible
export const Container = typediContainer;

// Re-export helpers so you can `import { Service, Inject, Token } from "@/server/di/container"`
export { Service, Inject, Token } from "typedi";