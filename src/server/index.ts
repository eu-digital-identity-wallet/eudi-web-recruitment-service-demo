import "server-only";
import "@/server/container";

// Import container initialization - services should be resolved at route level
export { Container } from "@/server/container";
