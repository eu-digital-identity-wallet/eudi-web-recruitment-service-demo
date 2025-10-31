# EUDI Web Recruitment Service Demo

A demonstration of a modern recruitment platform that leverages **EU Digital Identity Wallet (EUDI)** technology for secure candidate verification and credential management.

## Overview

This project showcases how traditional recruitment processes can be enhanced with digital identity verification and credential issuance capabilities using European Digital Identity Wallet standards. The platform enables employers to post jobs, candidates to apply using verified digital credentials, and facilitates secure credential verification and issuance.

## Key Features

- **Browse Jobs**: View available positions with detailed descriptions and required credentials
- **Secure Application**: Apply using verified digital identity credentials from EUDI Wallet
- **Two-Stage Verification**:
  - Initial PID verification (required for all applications)
  - Optional extras verification (diploma/seafarer certificates)
- **Document Signing with QES**: Sign employment contracts using Qualified Electronic Signatures (eIDAS QES)
  - Professional PDF contract generation with pdf-lib
  - SHA-256 document hashing for integrity verification
  - EUDI Wallet-based signing with qualified certificates
  - Real-time signing status polling
- **Multi-Device Support**: Same-device deep links and cross-device QR code flows
- **Independent Credential Tracking**: Each verified credential has its own transaction and status
- **Credential Management**: Receive verifiable employment credentials in wallet
- **Real-Time Polling**: 1.5-second polling intervals for verification and signing status updates
- **Professional Branding**: Consistent European Commission and EUDI Wallet branding
- **Modern UI**: Clean, responsive Material-UI design with accessibility features

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **Material-UI (MUI)** - Modern UI component library
- **TypeScript** - Type-safe development
- **Emotion** - CSS-in-JS styling
- **SWR** - Data fetching and caching

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

This application implements **Clean Architecture** with **Domain-Driven Design (DDD)** principles:

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  Next.js Pages (Server Components) + API Routes (REST)      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Application Layer                          │
│        Services (Business Logic & Orchestration)             │
│  ApplicationService │ VerifierService │ IssuerService        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Domain Layer                              │
│         Entities │ Value Objects │ Domain Logic              │
│   Application │ VerifiedCredential │ IssuedCredential        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Infrastructure Layer                            │
│  Repositories (Data Access) │ External APIs (EUDI)          │
│  ApplicationRepo │ CredentialRepo │ Verifier │ Issuer        │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
              PostgreSQL Database
```

### Key Design Patterns

1. **Repository Pattern**: All database access through repositories
2. **Dependency Injection**: TypeDI container manages service dependencies
3. **Service Layer Pattern**: Business logic isolated from API routes
4. **State Machine**: Application lifecycle managed with clear state transitions
5. **Decorator Pattern**: Input validation using Zod decorators

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
│   │   │   ├── verification/[id]/         # GET: PID verification status polling
│   │   │   ├── verification-extras/[id]/  # GET: Extras verification status polling
│   │   │   ├── signing-status/[id]/       # GET: Document signing status polling
│   │   │   ├── qr/[id]/                   # GET: Generate PID verification QR code
│   │   │   ├── qr-extras/[id]/            # GET: Generate extras verification QR code
│   │   │   ├── qr-sign/[id]/              # GET: Generate document signing QR code
│   │   │   ├── qr-issue/[id]/             # GET: Generate credential offer QR code
│   │   │   └── [id]/
│   │   │       ├── extras/                # POST: Request additional credentials
│   │   │       ├── sign-document/         # POST: Initiate contract signing
│   │   │       └── issue-receipt/         # POST: Issue application receipt credential
│   │   ├── documents/[state]/             # GET: Serve PDF documents for signing
│   │   ├── request.jwt/[state]/           # GET: Retrieve JWT signing request
│   │   └── signed-document/[state]/       # POST: Receive signed documents from wallet
│   ├── jobs/              # Job listing and detail pages
│   ├── applications/      # Application management and status pages
│   │   └── [id]/
│   │       ├── page.tsx                   # PID verification QR display
│   │       ├── callback/                  # Verification callback handler
│   │       ├── confirmation/              # Post-verification confirmation
│   │       ├── extras/                    # Additional credentials QR display
│   │       ├── sign-contract/             # Contract signing QR display
│   │       └── employee/                  # Credential issuance QR display
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage (redirects to /jobs)
├── components/            # Reusable UI components
│   ├── atoms/             # Basic components (buttons, forms, QR codes)
│   └── organisms/         # Complex components (job cards, application flows)
├── server/                # Server-side architecture (Clean Architecture + DDD)
│   ├── services/          # Business Logic Layer (Domain-Organized)
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
│   │   ├── DataDecoderService.ts  # CBOR/Base64 decoding utilities
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
  - `DataDecoderService`: CBOR/VP token decoding
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
Applications follow a state machine pattern: `CREATED → VERIFIED → ISSUED`

Each verified credential is tracked independently with status: `PENDING → VERIFIED`

**EUDI Integration:**

- **Dual Device Flows**: Same-device and cross-device verification
- **DCQL Queries**: Distributed credential query language support
- **CBOR Decoding**: Native handling of EUDI's binary data formats
- **Certificate Management**: Java keystore integration for JWT signing
- **Multi-Credential Support**: Separate verification sessions for PID and extras (diploma/seafarer)

## Application Flow

### 1. Job Discovery & Application Initiation

- Candidates browse available job postings at `/jobs`
- Each job displays required credentials (PID, Diploma, Seafarer Certificate)
- Candidate selects a job and chooses verification method (same-device or cross-device)

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

### 3. Confirmation & Optional Extras

- **Confirmation Page** (`/applications/[id]/confirmation`): Displays verified data
  - **EUDI Branding**: European Commission and EUDI Wallet logos
  - **Personal Data**: Shows all extracted information from PID
  - **Credential Status**: Visual chips showing verified PID credential
  - **Additional Information Section**:
    - **Option 1**: Provide additional credentials (diploma/seafarer certificates) - Optional
    - **Option 2**: Sign employment contract with QES - Proceeds to contract signing
    - **Option 3**: Skip to credential issuance - Direct to employee ID issuance

### 4. Additional Credentials Verification (Optional)

- **Extras Page** (`/applications/[id]/extras`): Separate QR code for additional credentials
- **New Verification Session**: Creates separate `VerifiedCredential` records for each credential type
- **Independent Tracking**: Each credential has its own verification transaction and status
- **Polling**: Application polls extras verification endpoint every 1 second
- **Return to Confirmation**: After successful verification, redirects back to confirmation page

### 5. Contract Signing with QES (Optional)

- **Sign Contract Page** (`/applications/[id]/sign-contract`): Document signing workflow
  - **PDF Generation**: Professional employment contract generated with pdf-lib
  - **Document Display**: QR code for EUDI Wallet to access signing request
  - **Signing Process**:
    1. Application initiates signing by calling `/api/applications/[id]/sign-document`
    2. PDF contract generated with candidate and job details
    3. SHA-256 hash calculated for document integrity
    4. `SignedDocument` record created with state UUID and document content
    5. JWT signing request created with document hash and location
    6. User scans QR code with EUDI Wallet
    7. Wallet retrieves document from `/api/documents/[state]`
    8. Wallet signs document with qualified certificate
    9. Signed document posted back to `/api/signed-document/[state]`
  - **Real-Time Polling**: Status updates every 1.5 seconds via `/api/applications/signing-status/[id]`
  - **Success Flow**: Redirects to confirmation page showing "Issue Employee ID" button
  - **Error Handling**: Toast notification with retry option on signing failure

### 6. Application Receipt Issuance

- **Employee Page** (`/applications/[id]/employee`): Final step
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

- `POST /api/applications/create` - Create new application with PID verification
- `GET /api/applications/verification/{id}` - Poll PID verification status
- `GET /api/applications/qr/{id}` - Generate PID verification QR code

#### Additional Credentials (Extras)

- `POST /api/applications/{id}/extras` - Request diploma/seafarer verification
- `GET /api/applications/verification-extras/{id}` - Poll extras verification status
- `GET /api/applications/qr-extras/{id}` - Generate extras verification QR code

#### Document Signing

- `POST /api/applications/{id}/sign-document` - Initiate contract signing (generates PDF, creates signing session)
- `GET /api/applications/qr-sign/{id}` - Generate document signing QR code
- `GET /api/applications/signing-status/{id}` - Poll document signing status
- `GET /api/request.jwt/{state}` - Retrieve JWT signing request for wallet
- `GET /api/documents/{state}` - Serve PDF document for signing
- `POST /api/signed-document/{state}` - Receive signed document from wallet

#### Credential Issuance

- `GET /api/applications/qr-issue/{id}` - Generate credential offer QR code
- `POST /api/applications/{id}/issue-receipt` - Issue application receipt credential

### Supported Credentials

#### Verified Credentials (From Wallet)

- **PID (Person Identification Data)** - Required for all applications
  - Namespace: `eu.europa.ec.eudi.pid.1`
  - Fields: family_name, given_name, birth_date, age_over_18, nationality, etc.
- **Educational Diploma** - Optional additional credential
  - Namespace: `eu.europa.ec.eudi.diploma.1`
- **Seafarer Certificate** - Optional additional credential for maritime positions
  - Namespace: `eu.europa.ec.eudi.seafarer.1`

#### Issued Credentials (To Wallet)

- **Employment Application Receipt** - Issued as verifiable mDoc credential
  - Type: `eu.europa.ec.eudi.employee_mdoc`
  - Contains: candidate info, job details, application ID

### Database Models

#### Application

- Tracks application lifecycle: `CREATED → VERIFIED → ISSUED`
- Stores candidate personal data from PID verification
- Relations: JobPosting, IssuedCredentials, VerifiedCredentials, SignedDocuments

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

- Job browsing and applications
- QR code scanning for cross-device verification
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

**Built with ❤️ for the EU Digital Identity ecosystem**
