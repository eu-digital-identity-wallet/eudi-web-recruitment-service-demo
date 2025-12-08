# EUDI Web Recruitment Service Demo

A demonstration of a modern recruitment platform that leverages **EU Digital Identity Wallet (EUDI)** technology for secure candidate verification and credential management.

## Overview

This project showcases how traditional recruitment processes can be enhanced with digital identity verification and credential issuance capabilities using European Digital Identity Wallet standards. The platform enables employers to post jobs, candidates to apply using verified digital credentials, and facilitates secure credential verification and issuance.

## Key Features

- **Browse Vacancies**: View available positions with detailed descriptions and required credentials
- **Secure Application**: Apply using verified digital identity credentials from EUDI Wallet
- **Multi-Stage Verification**:
  - Initial PID verification (required for all applications)
  - Optional professional qualifications verification (diploma/seafarer certificates)
  - Optional tax residency attestation
- **Document Signing with QES**: Sign employment contracts using Qualified Electronic Signatures (eIDAS QES)
  - Professional PDF contract generation with pdf-lib
  - SHA-256 document hashing for integrity verification
  - EUDI Wallet-based signing with qualified certificates
  - Real-time signing status polling
- **Intelligent Multi-Device Support**: Device-aware UI that automatically adapts
  - **Desktop**: QR code flows for cross-device verification
  - **Mobile**: Same-device deep link flows for seamless wallet integration
  - Automatic detection using `react-device-detect` library
  - Hydration-safe rendering to prevent SSR/client mismatches
- **Independent Credential Tracking**: Each verified credential has its own transaction and status
- **Credential Management**: Receive verifiable employment credentials in wallet
- **Real-Time Polling**: 1.5-second polling intervals for verification and signing status updates

## Tech Stack

### Frontend

- **Next.js 15.5.7** - React framework with App Router and Turbopack
- **React 19** - Latest React features
- **Material-UI (MUI)** - Modern UI component library
- **TypeScript** - Type-safe development
- **Emotion** - CSS-in-JS styling
- **SWR** - Data fetching and caching
- **react-device-detect** - Device type detection for adaptive UI (mobile vs desktop flows)

### Backend

- **Next.js API Routes** - Full-stack capabilities
- **Prisma ORM** - Database management and migrations
- **PostgreSQL** - Robust relational database
- **TypeDI** - Dependency injection container

### Digital Identity & Security

- **JOSE** - JSON Web Token handling (JWT signing with ES256)
- **CBOR-X** - Efficient credential encoding/decoding
- **JKS-JS** - Java KeyStore integration
- **QRCode** - QR code generation for verification flows
- **pdf-lib** - Professional PDF generation for contracts
- **crypto** - SHA-256 document hashing and cryptographic operations

### Development Tools

- **ESLint** - Code linting and formatting
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - Runtime type validation
- **Reflect Metadata** - Decorator support

## Architecture Overview

This application implements **Hexagonal Architecture (Ports & Adapters)** with **Clean Architecture** and **Domain-Driven Design (DDD)** principles:

### Architectural Layers

```mermaid
graph TD
    Presentation["PRESENTATION LAYER<br/><br/>Next.js Pages<br/>UI Components"]

    Interface["INTERFACE LAYER<br/><br/>API Routes<br/>Controllers (Inbound Adapters)"]

    Application["APPLICATION LAYER<br/><br/>Use Cases<br/>Ports: IRepositories, IVerifier, IIssuer"]

    Domain["DOMAIN LAYER<br/><br/>Entities + Value Objects<br/>Business Logic"]

    Infrastructure["INFRASTRUCTURE LAYER<br/><br/>Adapters implementing Ports:<br/>Repositories (DB) + API Adapters"]

    External["PostgreSQL + EUDI Services"]

    Presentation -->|HTTP| Interface
    Interface -->|DTOs| Application
    Application -->|Value Objects| Domain
    Application -->|depends on Ports| Infrastructure
    Infrastructure -->|implements Ports| Application
    Infrastructure --> External

    style Presentation fill:#f5e1ff,stroke:#333,stroke-width:2px
    style Interface fill:#ffe1f0,stroke:#333,stroke-width:2px
    style Application fill:#e1f0ff,stroke:#333,stroke-width:2px
    style Domain fill:#e1f5e1,stroke:#333,stroke-width:2px
    style Infrastructure fill:#fff4e1,stroke:#333,stroke-width:2px
    style External fill:#f0f0f0,stroke:#333,stroke-width:2px
```

### Hexagonal Architecture Principles

**Core Concept**: The domain (business logic) is isolated at the center, with all dependencies pointing inward.

**Ports & Adapters Pattern**:

- **Inbound Ports** (Use Case Interfaces): Define WHAT the application does
  - `ICreateApplicationUseCase`, `ICheckVerificationStatusUseCase`, `IGetPIDVerificationPageDataUseCase`, etc.
  - Implemented by Use Cases in the application layer
  - **Page-specific use cases**: Dedicated use cases for Next.js pages (e.g., `GetTaxResidencyPageDataUseCase`, `GetQualificationsPageDataUseCase`) that encapsulate data fetching, access control, and page-specific business logic

- **Outbound Ports** (Repository/Service Interfaces): Define external capabilities needed
  - Location: `/src/core/application/ports/outbound/`
  - Database Ports (Repository Interfaces):
    - `IApplicationRepository` ← Application persistence
    - `IVacancyRepository` ← Vacancy persistence
    - `IVerifiedCredentialRepository` ← Verified credentials persistence
    - `IIssuedCredentialRepository` ← Issued credentials persistence
    - `ISignedDocumentRepository` ← Signed documents persistence
  - External Service Ports:
    - `IVerifierPort` ← EUDI Verifier API integration
    - `IIssuerPort` ← EUDI Issuer API integration
    - `ICredentialVerificationPort` ← Credential verification operations
    - `ICredentialIssuancePort` ← Credential issuance operations
    - `IDocumentSigningPort` ← Document signing operations (QES)
    - `ICryptographyPort` ← Cryptographic operations (JWT signing)
    - `IKeystorePort` ← Keystore management
    - `IEventDispatcher` ← Domain event publishing (event-driven architecture)
  - All implemented by Adapters in the infrastructure layer

- **Adapters**: Convert between external formats and domain models
  - **Inbound Adapters** (`/src/core/interface/controllers/`): Convert HTTP requests → DTOs → Use Cases
  - **Outbound Adapters** (`/src/core/infrastructure/adapters/`):
    - **Persistence Adapters** (`/adapters/persistence/`): Prisma implementations of repository ports
      - `PrismaApplicationRepositoryAdapter` implements `IApplicationRepository`
      - `PrismaVacancyRepositoryAdapter` implements `IVacancyRepository`
      - `PrismaVerifiedCredentialRepositoryAdapter` implements `IVerifiedCredentialRepository`
      - `PrismaIssuedCredentialRepositoryAdapter` implements `IIssuedCredentialRepository`
      - `PrismaSignedDocumentRepositoryAdapter` implements `ISignedDocumentRepository`
    - **HTTP Adapters** (`/adapters/http/`): External API implementations
      - `EudiVerifierAdapter` implements `IVerifierPort`
      - `EudiIssuerAdapter` implements `IIssuerPort`
    - **Event Adapters** (`/adapters/events/`): Event bus implementations
      - `InMemoryEventDispatcher` implements `IEventDispatcher`

### Value Objects & Domain Modeling

The domain layer uses **Value Objects** to eliminate primitive obsession:

**Identity Value Objects**:

- `ApplicationId`, `VacancyId`, `TransactionId`

**Security & Auth Value Objects**:

- `DocumentHash`, `Nonce`, `PreAuthorizedCode`, `State`

**Credential Value Objects**:

- `CredentialType` (PID, DIPLOMA, SEAFARER, TAXRESIDENCY, EMPLOYEE, BOTH, NONE)
- `Namespace` (EUDI credential namespaces)

**Personal Information Value Objects**:

- `Email`, `FamilyName`, `GivenName`, `MobilePhone`, `DateOfBirth`, `Nationality`

**Descriptive Value Objects**:

- `Title`, `Description`, `Url`

**Benefits**:

- **Type Safety**: Compile-time prevention of invalid states
- **Self-Validation**: Cannot create invalid value objects
- **Encapsulation**: Business rules embedded in value objects
- **Immutability**: Value objects cannot be changed after creation
- **Expressiveness**: `Email.create(str)` vs `string`

### Architectural Boundaries

**Data Flow Across Layers**:

1. **HTTP Request** → Controller receives primitives (strings, booleans)
2. **Controller** → Validates input, calls Use Case with DTOs (strings)
3. **Use Case** → Converts DTOs to Value Objects, calls Domain Entities
4. **Domain Entities** → Pure business logic with Value Objects
5. **Repositories** → Convert Value Objects back to primitives for persistence
6. **HTTP Response** → Controllers serialize domain results to JSON

**Example**: Creating an Application

```typescript
// 1. API Route receives HTTP request
POST /api/applications/create
Body: { vacancyId: "abc123", sameDeviceFlow: true }

// 2. Controller calls Use Case with DTO (strings)
await createApplicationUseCase.execute({
  vacancyId: "abc123",     // string DTO
  sameDeviceFlow: true
})

// 3. Use Case converts to Value Objects
const vacancy = await vacancyRepo.findById(
  VacancyId.create("abc123")  // Value Object
)

// 4. Domain logic uses Value Objects
const application = Application.create({
  vacancyId: vacancy.getIdValueObject(),  // VacancyId value object
  status: ApplicationStatus.CREATED
})

// 5. Repository persists (converts back to primitives)
await applicationRepo.save({
  id: application.getId(),           // string
  vacancyId: application.getVacancyId(), // string
  status: application.getStatus()     // string enum
})
```

### Key Design Patterns

1. **Hexagonal Architecture**: Domain isolated from external concerns via ports & adapters
2. **Value Objects**: Rich domain modeling with self-validating immutable objects
3. **Repository Pattern**: All database access through repository interfaces (outbound ports)
4. **Dependency Injection**: TypeDI container manages all dependencies
5. **Use Case Pattern**: Each business operation is a separate use case class
6. **Mapper Pattern**: Convert between domain models and persistence models
7. **Decorator Pattern**: Input validation using Zod decorators (`@ValidateInput`)
8. **Domain Events**: Entities raise events for cross-aggregate communication (event-driven architecture)

### Domain Events Architecture

The application uses **domain events** to enable loose coupling and event-driven workflows:

**Event Flow:**

1. Entity raises event when something significant happens (e.g., `ApplicationVerified`)
2. Entity stores event in internal collection via `addDomainEvent()`
3. Use case retrieves events via `getDomainEvents()` after persistence
4. Use case publishes events via `IEventDispatcher` port
5. Event handlers react to events (logging, notifications, analytics, etc.)
6. Use case clears events via `clearDomainEvents()`

**Current Domain Events:**

- `ApplicationVerified` - Raised when PID verification completes successfully
- `QualificationVerified` - Raised when professional qualification is verified (Diploma, Seafarer, Tax Residency)
- `DocumentSigned` - Raised when contract is electronically signed with QES
- `CredentialIssued` - Raised when employee credential is issued to wallet

**Event Handlers:**

- `ApplicationVerifiedHandler` - Logs PID verification events (future: send confirmation emails)
- `QualificationVerifiedHandler` - Logs qualification verification events (Diploma, Seafarer, Tax Residency)
- `DocumentSignedHandler` - Logs document signing events (future: send confirmation, trigger credential issuance)
- `CredentialIssuedHandler` - Logs credential issuance events (future: send credential offer notification)

**Infrastructure:**

- `IEventDispatcher` port - Defines event publishing interface
- `InMemoryEventDispatcher` adapter - Simple in-memory event bus (suitable for single-instance deployments)
- Event handlers registered in `/src/core/infrastructure/config/event-handlers.ts`

### Implementation Details

**Repository Layer** - 5 repositories implementing outbound ports:

- `ApplicationRepository` - Application/job application management
- `VacancyRepository` - Job vacancy management
- `IssuedCredentialRepository` - Issued credentials tracking
- `VerifiedCredentialRepository` - Verified credentials from wallet
- `SignedDocumentRepository` - Document signing workflows

**Service Layer** - Organized by domain:

- **Verification Services**: `CredentialVerificationService`, `PidQueryService`, `DiplomaQueryService`, `SeafarerQueryService`, `TaxResidencyQueryService`
- **Issuance Services**: `EmployeeCredentialService`
- **Signing Services**: `DocumentSigningService`, `ContractPdfGeneratorService`, `DocumentHashService`
- **Domain Services**: `CredentialDecoderService` (CBOR/SD-JWT decoding), `JWTService` (JWT signing)
- **Infrastructure Services**: `VerifierService`, `IssuerService`, `KeystoreService`

### Verification Flow Architecture

The application supports a **two-stage verification process**:

**Stage 1: PID Verification (Required)**

- Creates `Application` with status `CREATED`
- Creates `VerifiedCredential` record for PID with status `PENDING`
- User scans QR code with EUDI Wallet
- Polls verifier API every 1 second
- On success: Updates to `VERIFIED`, extracts candidate data

**Stage 2: Extras Verification (Optional)**

- User chooses to provide diploma/seafarer certificate
- Creates separate `VerifiedCredential` records for each credential type
- New QR code and verification session
- Independent polling and status tracking
- Each credential verified independently

### Data Flow

```
User → Next.js Page → API Route → Service → Repository → Database
                           ↓
                    External EUDI APIs
                    (Verifier/Issuer)
```

## Documentation

For detailed architectural diagrams and flow visualizations, see:

- **[Flowcharts & Diagrams](./docs/flowcharts.md)** - Complete visual documentation including:
  - Overall application flow with all stages
  - PID verification sequence diagram
  - Additional credentials verification flow
  - Document signing (QES) workflow with wallet integration
  - Credential issuance flow
  - Data flow architecture and service layer organization
  - Application state machine
  - Database schema relationships
  - Component architecture
  - CBOR decoding flow for VP tokens

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+, ideally 22
- **PostgreSQL** database
- **EUDI Verifier & Issuer APIs** (configured endpoints)
- **Java KeyStore** file for credential signing

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eudi-web-recruitment-service-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file with the following variables:

   ```bash
   # Database
   POSTGRES_CONNECTION_STRING="postgresql://user:password@localhost:5432/eudi_recruitment"

   # EUDI Verifier Integration
   VERIFIER_API_URL="https://dev.verifier.eudiw.dev"
   VERIFIER_CLIENT_ID="your_client_id"

   # EUDI Issuer Integration
   ISSUER_API_URL="https://dev.issuer.eudiw.dev"
   ISSUER_CLIENT_ID="your_issuer_client_id"

   # Keystore Configuration (for JWT signing)
   KEYSTORE_FILE="/path/to/your/keystore.jks"
   KEYSTORE_PASS="your_keystore_password"
   KEYSTORE_ALIAS="your_key_alias"

   # Application Configuration
   NEXT_PUBLIC_APP_NAME="EUDI Recruitment Demo"
   NEXT_PUBLIC_APP_URI="http://localhost:3000"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push

   # (Optional) Seed with sample data
   npm run seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── applications/   # Application-related endpoints
│   │   │   ├── create/                    # POST: Create new applications
│   │   │   └── [id]/
│   │   │       ├── verify-pid/            # POST: Initiate PID verification
│   │   │       ├── verify-pid-status/     # GET: PID verification status polling
│   │   │       ├── qr-verify-pid/         # GET: Generate PID verification QR code
│   │   │       ├── verify-qualifications/ # POST: Request qualifications verification
│   │   │       ├── verify-qualifications-status/  # GET: Qualifications status polling
│   │   │       ├── qr-verify-qualifications/      # GET: Generate qualifications QR code
│   │   │       ├── verify-tax-residency/  # POST: Request tax residency verification
│   │   │       ├── sign-contract/         # POST: Initiate contract signing
│   │   │       ├── sign-contract-status/  # GET: Document signing status polling
│   │   │       ├── sign-contract-url/     # GET: Get signing transaction URL
│   │   │       ├── qr-contract-signing/   # GET: Generate document signing QR code
│   │   │       ├── issue-employee-id/     # POST: Issue employee credential
│   │   │       ├── qr-issue-employee-id/  # GET: Generate credential offer QR code
│   │   │       └── deep-link/             # GET: Generate deep link for same-device flow
│   │   ├── documents/[state]/             # POST: Store signed documents from wallet
│   │   ├── request.jwt/[state]/           # GET: Retrieve JWT signing request
│   │   │   └── debug/                     # GET: Debug JWT requests
│   │   └── signed-document/[state]/       # GET: Retrieve signed documents
│   ├── vacancies/         # Vacancy listing and detail pages
│   │   └── [id]/          # Vacancy detail page
│   ├── applications/      # Application management and status pages
│   │   └── [id]/
│   │       ├── page.tsx                   # PID verification QR display
│   │       ├── callback/                  # Verification callback handler
│   │       ├── qualifications/            # Professional qualifications QR display
│   │       ├── tax-residency/             # Tax residency attestation QR display
│   │       ├── finalise/                  # Application finalization page
│   │       ├── sign-contract/             # Contract signing QR display
│   │       ├── employee/                  # Credential issuance summary
│   │       └── employee-qr/               # Credential offer QR display
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage (redirects to /vacancies)
├── components/            # Reusable UI components
│   ├── atoms/             # Basic components (buttons, forms, QR codes)
│   ├── molecules/         # Composite components (vacancy cards, forms)
│   ├── organisms/         # Complex components (sections, flows)
│   └── pages/             # Page-level components
├── core/                  # Core business logic (Hexagonal Architecture + DDD)
│   ├── application/       # Application Layer
│   │   ├── ports/         # Hexagonal Architecture Ports
│   │   │   ├── inbound/   # Use Case interfaces (what app does)
│   │   │   └── outbound/  # External service interfaces (repositories, APIs)
│   │   └── usecases/      # Use Case implementations
│   ├── domain/            # Domain Layer (Business Rules)
│   │   ├── model/         # Domain Entities (Application, Vacancy, etc.)
│   │   ├── value-objects/ # Value Objects (CredentialType, Email, etc.)
│   │   ├── mappers/       # Domain ↔ Persistence converters
│   │   ├── events/        # Domain Events
│   │   └── services/      # Domain Services
│   ├── infrastructure/    # Infrastructure Layer (Adapters)
│   │   ├── adapters/      # Outbound port implementations
│   │   │   ├── http/      # External API adapters (EUDI Verifier/Issuer)
│   │   │   └── persistence/ # Repository implementations (Prisma adapters)
│   │   └── config/        # DI container configuration
│   ├── interface/         # Interface Layer (Inbound Adapters)
│   │   └── controllers/   # HTTP request handlers
│   └── shared/            # Shared utilities
│       ├── types/         # Shared types and schemas
│       │   ├── schemas/   # Zod validation schemas
│       │   └── types/     # TypeScript type definitions
│       └── utils/         # Utility functions
├── server/                # Legacy server code (being migrated to /core)
│   │   ├── verification/  # Credential verification domain
│   │   │   ├── CredentialVerificationService.ts  # Orchestrates verification workflows
│   │   │   └── queries/   # DCQL query builders
│   │   │       ├── PidQueryService.ts       # PID credential queries
│   │   │       ├── DiplomaQueryService.ts   # Diploma credential queries
│   │   │       └── SeafarerQueryService.ts  # Seafarer credential queries
│   │   ├── issuance/      # Credential issuance domain
│   │   │   └── EmployeeCredentialService.ts  # Employee credential data builder
│   │   ├── signing/       # Document signing domain
│   │   │   ├── DocumentSigningService.ts        # QES signing workflow orchestration
│   │   │   ├── ContractPdfGeneratorService.ts   # Professional PDF generation
│   │   │   └── DocumentHashService.ts           # SHA-256 hashing & verification
│   │   ├── ApplicationService.ts  # Main application workflow orchestrator
│   │   ├── JobService.ts          # Job posting operations
│   │   ├── VerifierService.ts     # EUDI verifier API integration
│   │   ├── IssuerService.ts       # EUDI issuer API integration
│   │   ├── JWTService.ts          # JWT signing with ES256 + certificates
│   │   ├── CredentialDecoderService.ts  # CBOR/SD-JWT credential decoding (Domain Service)
│   │   └── KeystoreService.ts     # Java keystore (JKS) management
│   ├── repositories/      # Data Access Layer
│   │   ├── ApplicationRepository.ts         # Application lifecycle management
│   │   ├── JobRepository.ts                 # Job CRUD operations
│   │   ├── CredentialRepository.ts          # Issued credentials tracking
│   │   ├── VerifiedCredentialRepository.ts  # Verified credentials from wallet
│   │   └── SignedDocumentRepository.ts      # Signed documents (optimized queries)
│   ├── schemas/           # Input Validation (Zod)
│   │   ├── application.ts  # Application creation, verification schemas
│   │   └── job.ts         # Job validation schemas
│   ├── decorators/        # Cross-Cutting Concerns
│   │   └── validate-input.ts # Method decorator for input validation
│   ├── types/             # Type Definitions
│   │   ├── eudi.ts        # EUDI-specific types (VP tokens, DCQL)
│   │   └── jwt.ts         # JWT payload structures
│   ├── utils/             # Utility Functions
│   │   └── dcql-queries.ts # DCQL query builders for credentials
│   ├── container.ts       # TypeDI dependency injection setup
│   ├── index.ts          # Service resolution and exports
│   └── prisma.ts         # Database client singleton
└── theme.ts              # Material-UI theme configuration

prisma/
├── schema.prisma         # Database schema (JobPosting, Application, IssuedCredential, VerifiedCredential, SignedDocument)
├── migrations/           # Database migration history
└── seed.ts              # Database seeding script

scripts/                  # Testing and utility scripts
└── clear-signed-documents.ts      # Database cleanup for signed documents

development/              # Development utilities and scripts

env.ts                    # Environment variable validation and types
```

### **Server Architecture Details**

The `/server` directory implements a **Clean Architecture** pattern with **Dependency Injection**:

#### **Layer Separation:**

```
API Routes → Services (Business Logic) → Repositories (Data Access) → Database (Prisma)
```

#### **Key Components:**

**Services Layer (Domain-Organized):**

Services are now organized into domain-specific modules for better separation of concerns:

- **Verification Services** (`/services/verification/`):
  - `CredentialVerificationService`: Orchestrates verification workflows and builds complete DCQL requests
  - `PidQueryService`: Builds DCQL queries for PID (Personal Identity Document) credentials
  - `DiplomaQueryService`: Builds DCQL queries for diploma credentials
  - `SeafarerQueryService`: Builds DCQL queries for seafarer certificate credentials
- **Issuance Services** (`/services/issuance/`):
  - `EmployeeCredentialService`: Builds employee credential data for issuance
- **Signing Services** (`/services/signing/`):
  - `DocumentSigningService`: Orchestrates QES document signing workflows and prepares EUDI signing requests
  - `ContractPdfGeneratorService`: Generates professional PDF employment contracts using pdf-lib
  - `DocumentHashService`: Calculates and verifies SHA-256 document hashes for integrity
- **Core Services**:
  - `ApplicationService`: Orchestrates the complete application workflow (creation → verification → issuance)
  - `VerifierService`: EUDI verifier API integration
  - `IssuerService`: EUDI issuer API integration using OpenID4VCI standards
  - `CredentialDecoderService`: Multi-format credential decoding (CBOR mDoc & SD-JWT)
  - `JWTService`: JWT signing
  - `KeystoreService`: Keystore management

**Data Layer:**

- **Repositories**: Abstract database operations with Prisma
  - `ApplicationRepository`: Application lifecycle and status management
  - `JobRepository`: Job posting CRUD operations
  - `CredentialRepository`: Issued credentials tracking (for wallet claims)
  - `VerifiedCredentialRepository`: Verified credentials from wallet (PID, Diploma, Seafarer)
  - `SignedDocumentRepository`: Document signing sessions and signed contracts (optimized to avoid ArrayBuffer detachment)
- **Schemas**: Zod-based input validation with decorator support
- **Types**: EUDI-specific type definitions and JWT structures

**State Management:**
Applications follow a state machine pattern with 13 states:

```
CREATED → VERIFYING → VERIFIED → QUALIFYING → QUALIFIED → FINALIZED → SIGNING → SIGNED → ISSUING → ISSUED → ARCHIVED
```

Alternative states: `ERROR`, `REJECTED`

Each verified credential is tracked independently with status: `PENDING → VERIFIED` or `FAILED`

**EUDI Integration:**

- **Dual Device Flows**: Same-device and cross-device verification
- **DCQL Queries**: Distributed credential query language support
- **CBOR Decoding**: Native handling of EUDI's binary data formats
- **Certificate Management**: Java keystore integration for JWT signing
- **Multi-Credential Support**: Separate verification sessions for PID and extras (diploma/seafarer)

## Application Flow

### 1. Vacancy Discovery & Application Initiation

- Candidates browse available vacancies at `/vacancies`
- Each vacancy displays required credentials (PID, Diploma, Seafarer Certificate, Tax Residency)
- Candidate selects a vacancy and chooses verification method (same-device or cross-device)

### 2. Initial PID Verification (Required)

- **QR Code Display**: Application page (`/applications/[id]`) shows QR code
  - "Scan with EUDI Wallet" header
  - European Commission and EUDI Wallet logos for branding
  - Loading indicator: "Waiting for verification from EUDI Wallet"
- **Wallet Interaction**: User scans QR code with EUDI Wallet app
- **Verification Process**: Application polls every 1 second for verification status
- **Data Storage**: Creates `VerifiedCredential` record for PID with status tracking
- **Data Extraction**: Personal information extracted from verified PID:
  - Family name, given name
  - Date of birth
  - Nationality
  - Email address
  - Mobile phone number

### 3. Finalization & Optional Credentials

- **Finalization Page** (`/applications/[id]/finalise`): Displays verified data
  - **EUDI Branding**: European Commission and EUDI Wallet logos
  - **Personal Data**: Shows all extracted information from PID
  - **Credential Status**: Visual chips showing verified credentials
  - **Options**:
    - **Provide Professional Qualifications**: Diploma/seafarer certificates (optional)
    - **Provide Tax Residency**: Tax residency attestation (optional)
    - **Sign Employment Contract**: Proceeds to contract signing with QES
    - **Issue Employee ID**: Direct to credential issuance (after signing)

### 4. Professional Qualifications Verification (Optional)

- **Qualifications Page** (`/applications/[id]/qualifications`): Separate QR code for qualifications
- **New Verification Session**: Creates separate `VerifiedCredential` records for each credential type
- **Independent Tracking**: Each credential has its own verification transaction and status
- **Polling**: Application polls qualifications verification endpoint every 1 second
- **Return to Finalization**: After successful verification, redirects back to finalization page

### 5. Tax Residency Attestation (Optional)

- **Tax Residency Page** (`/applications/[id]/tax-residency`): Separate QR code for tax residency
- **SD-JWT Format**: Tax residency uses SD-JWT credential format
- **Independent Tracking**: Separate verification transaction and status
- **Return to Finalization**: After successful verification, redirects back to finalization page

### 6. Contract Signing with QES (Required)

- **Sign Contract Page** (`/applications/[id]/sign-contract`): Document signing workflow
  - **PDF Generation**: Professional employment contract generated with pdf-lib
  - **Document Display**: QR code for EUDI Wallet to access signing request
  - **Signing Process**:
    1. Application initiates signing by calling `/api/applications/[id]/sign-contract`
    2. PDF contract generated with candidate and vacancy details
    3. SHA-256 hash calculated for document integrity
    4. `SignedDocument` record created with state UUID and document content
    5. JWT signing request created with document hash and location
    6. User scans QR code with EUDI Wallet
    7. Wallet retrieves document from `/api/documents/[state]`
    8. Wallet signs document with qualified certificate
    9. Signed document posted back to `/api/signed-document/[state]`
  - **Real-Time Polling**: Status updates every 1 second via `/api/applications/[id]/sign-contract-status`
  - **Success Flow**: Redirects to finalization page showing "Issue Employee ID" button
  - **Error Handling**: Toast notification with retry option on signing failure

### 7. Application Receipt Issuance

- **Employee Page** (`/applications/[id]/employee`): Credential issuance summary
- **Employee QR Page** (`/applications/[id]/employee-qr`): QR code display for credential claim
- **Credential Offer**: QR code for receiving employment credential
- **Pre-Authorized Flow**: Uses OpenID4VCI pre-authorized code grant
- **Issuer Integration**: Credential created and signed by external EUDI Issuer API
- **Wallet Storage**: User scans QR code and receives credential in wallet

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes to database

# Testing & Utilities

```

### Testing Document Signing

You can test the document signing endpoints manually with curl:

```bash
# Create signing session
curl -X POST http://localhost:3000/api/applications/{id}/sign-document

# Download PDF document
curl http://localhost:3000/api/documents/{state} -o contract.pdf

# Retrieve JWT signing request (debug)
curl http://localhost:3000/api/request.jwt/{state}/debug

# Check signing status
curl http://localhost:3000/api/applications/signing-status/{id}

# Clear all signed documents (cleanup utility)
npx tsx scripts/clear-signed-documents.ts
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for Next.js and React best practices
- **Prisma**: Type-safe database operations
- **Zod**: Runtime environment validation

## API Integration

### EUDI Wallet Integration

The application integrates with EUDI-compliant verifier and issuer services:

- **Verifier API**: Handles credential verification requests via DCQL queries
- **Issuer API**: Issues new credentials to verified candidates via OpenID4VCI
- **Same-Device Flow**: Direct wallet integration using deep links (`eudi-openid4vp://`)
- **Cross-Device Flow**: QR code-based verification across devices

### API Endpoints

#### Application Management

- `POST /api/applications/create` - Create new application
- `POST /api/applications/{id}/verify-pid` - Initiate PID verification
- `GET /api/applications/{id}/verify-pid-status` - Poll PID verification status
- `GET /api/applications/{id}/qr-verify-pid` - Generate PID verification QR code
- `GET /api/applications/{id}/deep-link` - Generate deep link for same-device flow

#### Professional Qualifications

- `POST /api/applications/{id}/verify-qualifications` - Request diploma/seafarer verification
- `GET /api/applications/{id}/verify-qualifications-status` - Poll qualifications verification status
- `GET /api/applications/{id}/qr-verify-qualifications` - Generate qualifications verification QR code

#### Tax Residency

- `POST /api/applications/{id}/verify-tax-residency` - Request tax residency attestation

#### Document Signing

- `POST /api/applications/{id}/sign-contract` - Initiate contract signing (generates PDF, creates signing session)
- `GET /api/applications/{id}/sign-contract-status` - Poll document signing status
- `GET /api/applications/{id}/sign-contract-url` - Get signing transaction URL
- `GET /api/applications/{id}/qr-contract-signing` - Generate document signing QR code
- `GET /api/request.jwt/{state}` - Retrieve JWT signing request for wallet
- `POST /api/documents/{state}` - Store signed document from wallet
- `GET /api/signed-document/{state}` - Retrieve signed document

#### Credential Issuance

- `GET /api/applications/{id}/qr-issue-employee-id` - Generate credential offer QR code
- `POST /api/applications/{id}/issue-employee-id` - Issue employee credential

### Supported Credentials

#### Verified Credentials (From Wallet)

- **PID (Person Identification Data)** - Required for all applications
  - Namespace: `eu.europa.ec.eudi.pid.1`
  - Fields: family_name, given_name, birth_date, age_over_18, nationality, etc.
- **Educational Diploma** - Optional additional credential
  - Namespace: `eu.europa.ec.eudi.diploma.1`
- **Seafarer Certificate** - Optional additional credential for maritime positions
  - Namespace: `eu.europa.ec.eudi.seafarer.1`
- **Tax Residency Attestation** - Optional tax residency credential
  - Format: SD-JWT

#### Issued Credentials (To Wallet)

- **Employment Application Receipt** - Issued as verifiable mDoc credential
  - Type: `eu.europa.ec.eudi.employee_mdoc`
  - Contains: candidate info, job details, application ID

### Database Models

#### Application

- Tracks application lifecycle with 13 states:
  ```
  CREATED → VERIFYING → VERIFIED → QUALIFYING → QUALIFIED → FINALIZED → SIGNING → SIGNED → ISSUING → ISSUED → ARCHIVED
  ```
- Alternative states: `ERROR`, `REJECTED`
- Stores candidate personal data from PID verification
- Relations: Vacancy, IssuedCredentials, VerifiedCredentials, SignedDocuments

#### SignedDocument

- Tracks document signing sessions and signed contracts
- Fields: documentHash (SHA-256), documentType, documentLabel, documentContent (Bytes)
- Transaction tracking: state (UUID), nonce (replay protection)
- Signature data: documentWithSignature (signed PDF), signatureObject, signerCertificate
- Status: `PENDING → SIGNED` or `FAILED`
- **Optimization**: Repository excludes large binary fields by default to prevent ArrayBuffer detachment issues

#### VerifiedCredential

- Tracks each credential verification independently
- Fields: credentialType, namespace, verifierTransactionId, verifierRequestUri
- Status: `PENDING → VERIFIED` or `FAILED`
- Stores extracted credential data as JSON

#### IssuedCredential

- Tracks credentials offered to wallets
- Fields: preAuthorizedCode, credentialOfferUrl, credentialType, credentialData
- Tracks claim status and expiration

## Mobile Compatibility

The application is fully responsive and supports mobile devices for:

- Vacancy browsing and applications
- QR code scanning for cross-device verification
- Same-device deep link flows for seamless wallet integration
- Credential management and viewing

## Security Considerations

- **Environment Variables**: Secure configuration management with Zod validation
- **Credential Verification**: Cryptographic verification of digital credentials
- **Data Privacy**: Minimal personal data retention, focused on verified attributes
- **Secure Communication**: HTTPS-only in production environments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the EU Digital Identity Wallet initiative and follows applicable EU regulations and standards.

## Support

For questions about EUDI wallet integration or technical issues:

1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Review [EUDI Wallet specifications](https://digital-strategy.ec.europa.eu/en/policies/eudi-wallet)
3. Open an issue in this repository

---

**Built with meraki for the EU Digital Identity ecosystem**
