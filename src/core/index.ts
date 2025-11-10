import 'server-only';
import '@/core/infrastructure/config/container';

/**
 * Core Module - Public API for Presentation Layer
 *
 * This module provides a clean boundary between the presentation layer (routes/pages)
 * and the application core (use cases, domain, infrastructure).
 *
 * Presentation layer should:
 * 1. Import { Container } from '@/core'
 * 2. Import specific use case classes from '@/core/application/usecases'
 * 3. Call Container.get(UseCase) to resolve instances
 * 4. Execute use cases and work with returned DTOs
 *
 * Presentation layer should NOT:
 * - Import domain entities or value objects
 * - Import repositories or infrastructure adapters
 * - Import dependency injection tokens
 * - Call domain methods directly
 */

// Re-export Container for presentation layer use
export { Container } from '@/core/application/usecases';
