import 'server-only';
import 'reflect-metadata';
import { Container as typediContainer } from 'typedi';

// Import and re-export tokens separately to avoid circular dependencies
export * from './tokens';

// Import tokens for manual binding of adapters to port interfaces

// Import infrastructure adapters (these need manual binding to tokens)
import { JksKeystoreAdapter } from '@/core/infrastructure/adapters/crypto/JksKeystoreAdapter';
import { InMemoryEventDispatcher } from '@/core/infrastructure/adapters/events/InMemoryEventDispatcher';
import { EudiIssuerAdapter } from '@/core/infrastructure/adapters/http/EudiIssuerAdapter';
import { EudiVerifierAdapter } from '@/core/infrastructure/adapters/http/EudiVerifierAdapter';
import { PrismaApplicationRepositoryAdapter } from '@/core/infrastructure/adapters/persistence/PrismaApplicationRepositoryAdapter';
import { PrismaIssuedCredentialRepositoryAdapter } from '@/core/infrastructure/adapters/persistence/PrismaIssuedCredentialRepositoryAdapter';
import { PrismaSignedDocumentRepositoryAdapter } from '@/core/infrastructure/adapters/persistence/PrismaSignedDocumentRepositoryAdapter';
import { PrismaVacancyRepositoryAdapter } from '@/core/infrastructure/adapters/persistence/PrismaVacancyRepositoryAdapter';
import { PrismaVerifiedCredentialRepositoryAdapter } from '@/core/infrastructure/adapters/persistence/PrismaVerifiedCredentialRepositoryAdapter';
import { registerEventHandlers } from '@/core/infrastructure/config/event-handlers';

import {
	IApplicationRepositoryToken,
	IVacancyRepositoryToken,
	IVerifiedCredentialRepositoryToken,
	ISignedDocumentRepositoryToken,
	ICredentialRepositoryToken,
	IVerifierPortToken,
	IIssuerPortToken,
	IKeystorePortToken,
} from './tokens';

/**
 * Dependency Injection Container - Hexagonal Architecture
 *
 * This module configures the bindings between port interfaces (domain/application layers)
 * and their concrete adapter implementations (infrastructure layer).
 *
 * Key Principles:
 * - Use cases are auto-registered via @Service() decorator - NO manual registration needed!
 * - Adapters are manually bound to port tokens below
 * - This implements Dependency Inversion Principle:
 *   → Domain/Application depend on abstractions (port interfaces)
 *   → Infrastructure implements those abstractions (adapters)
 *   → DI container wires them together at runtime
 *
 * Adding a New Service:
 * 1. For Use Cases: Just add @Service() decorator - that's it!
 * 2. For Adapters: Add @Service() decorator + bind to token below in configureContainer()
 */

// Use the global container so @Service() registrations are visible
export const Container = typediContainer;

// Re-export helpers
export { Service, Inject, Token } from 'typedi';

/**
 * Configure port-to-adapter bindings
 * Only infrastructure adapters need manual registration here.
 * Use cases are auto-registered via @Service() decorator.
 */
export function configureContainer() {
	// Persistence Layer - Prisma repository adapters
	Container.set({ id: IApplicationRepositoryToken, type: PrismaApplicationRepositoryAdapter });
	Container.set({ id: IVacancyRepositoryToken, type: PrismaVacancyRepositoryAdapter });
	Container.set({
		id: IVerifiedCredentialRepositoryToken,
		type: PrismaVerifiedCredentialRepositoryAdapter,
	});
	Container.set({
		id: ISignedDocumentRepositoryToken,
		type: PrismaSignedDocumentRepositoryAdapter,
	});
	Container.set({ id: ICredentialRepositoryToken, type: PrismaIssuedCredentialRepositoryAdapter });

	// HTTP Layer - External service adapters
	Container.set({ id: IVerifierPortToken, type: EudiVerifierAdapter });
	Container.set({ id: IIssuerPortToken, type: EudiIssuerAdapter });

	// Crypto Layer - Keystore adapter
	Container.set({ id: IKeystorePortToken, type: JksKeystoreAdapter });

	// Event Infrastructure - In-memory event dispatcher
	Container.set({ id: 'IEventDispatcher', type: InMemoryEventDispatcher });
}

// Initialize container bindings at module load time
configureContainer();

// Register event handlers after container is configured
registerEventHandlers();
