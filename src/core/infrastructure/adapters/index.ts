/**
 * Infrastructure Adapters - Hexagonal Architecture
 *
 * Adapters are concrete implementations of the port interfaces defined in the domain layer.
 * They handle communication with external systems (databases, APIs, file systems, etc.)
 *
 * Organization:
 * - persistence/ - Database adapters (Prisma, MongoDB, etc.)
 * - http/ - External HTTP API adapters (EUDI Verifier, Issuer, etc.)
 * - crypto/ - Cryptographic service adapters (JKS, PKCS12, etc.)
 */

// Persistence adapters
export * from './persistence/PrismaApplicationRepositoryAdapter';
export * from './persistence/PrismaVacancyRepositoryAdapter';
export * from './persistence/PrismaIssuedCredentialRepositoryAdapter';
export * from './persistence/PrismaSignedDocumentRepositoryAdapter';
export * from './persistence/PrismaVerifiedCredentialRepositoryAdapter';

// HTTP adapters
export * from './http/EudiVerifierAdapter';
export * from './http/EudiIssuerAdapter';

// Crypto adapters
export * from './crypto/JksKeystoreAdapter';
