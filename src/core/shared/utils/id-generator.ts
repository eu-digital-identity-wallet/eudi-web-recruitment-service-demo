import { randomUUID } from 'crypto';

/**
 * ID Generator Utility
 *
 * Generates unique identifiers for domain entities.
 * Uses crypto.randomUUID() for secure random IDs.
 */

/**
 * Generate a unique ID (UUID v4)
 */
export function generateId(): string {
	return randomUUID();
}
