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
- **Multi-Device Support**: Same-device deep links and cross-device QR code flows
- **Independent Credential Tracking**: Each verified credential has its own transaction and status
- **Credential Management**: Receive verifiable employment credentials in wallet
- **Real-Time Polling**: 1-second polling intervals for verification status updates
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
- **JOSE** - JSON Web Token handling
- **CBOR-X** - Efficient credential encoding/decoding
- **JKS-JS** - Java KeyStore integration
- **QRCode** - QR code generation for verification flows

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
│   │   └── applications/   # Application-related endpoints
│   │       ├── create/                    # POST: Create new applications
│   │       ├── verification/[id]/         # GET: PID verification status polling
│   │       ├── verification-extras/[id]/  # GET: Extras verification status polling
│   │       ├── qr/[id]/                   # GET: Generate PID verification QR code
│   │       ├── qr-extras/[id]/            # GET: Generate extras verification QR code
│   │       ├── qr-issue/[id]/             # GET: Generate credential offer QR code
│   │       └── [id]/
│   │           ├── extras/                # POST: Request additional credentials
│   │           └── issue-receipt/         # POST: Issue application receipt credential
│   ├── jobs/              # Job listing and detail pages
│   ├── applications/      # Application management and status pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage (redirects to /jobs)
├── components/            # Reusable UI components
│   ├── atoms/             # Basic components (buttons, forms, QR codes)
│   └── organisms/         # Complex components (job cards, application flows)
├── server/                # Server-side architecture (Clean Architecture + DDD)
│   ├── services/          # Business Logic Layer
│   │   ├── ApplicationService.ts  # Main application workflow orchestrator
│   │   ├── JobService.ts          # Job posting operations
│   │   ├── VerifierService.ts     # EUDI credential verification
│   │   ├── IssuerService.ts       # EUDI credential issuance
│   │   ├── JWTService.ts          # JWT signing with ES256 + certificates
│   │   ├── DataDecoderService.ts  # CBOR/Base64 decoding utilities
│   │   └── KeystoreService.ts     # Java keystore (JKS) management
│   ├── repositories/      # Data Access Layer
│   │   ├── ApplicationRepository.ts         # Application lifecycle management
│   │   ├── JobRepository.ts                 # Job CRUD operations
│   │   ├── CredentialRepository.ts          # Issued credentials tracking
│   │   └── VerifiedCredentialRepository.ts  # Verified credentials from wallet
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
├── schema.prisma         # Database schema (JobPosting, Application, IssuedCredential, VerifiedCredential)
├── migrations/           # Database migration history
└── seed.ts              # Database seeding script

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

**Services Layer:**
- **ApplicationService**: Orchestrates the complete application workflow (creation → verification → issuance)
- **VerifierService**: EUDI credential verification with DCQL queries and CBOR decoding
- **IssuerService**: EUDI credential issuance using OpenID4VCI standards
- **Supporting Services**: JWT signing, data decoding, keystore management

**Data Layer:**
- **Repositories**: Abstract database operations with Prisma
  - `ApplicationRepository`: Application lifecycle and status management
  - `JobRepository`: Job posting CRUD operations
  - `CredentialRepository`: Issued credentials tracking (for wallet claims)
  - `VerifiedCredentialRepository`: Verified credentials from wallet (PID, Diploma, Seafarer)
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
  - **Additional Information Section**: If job requires diploma/seafarer certificate:
    - User can choose to provide additional credentials
    - "Provide Diploma", "Provide Seafarer Certificate", or "Provide Both" buttons
    - Optional - user can skip and proceed to credential issuance

### 4. Additional Credentials Verification (Optional)
- **Extras Page** (`/applications/[id]/extras`): Separate QR code for additional credentials
- **New Verification Session**: Creates separate `VerifiedCredential` records for each credential type
- **Independent Tracking**: Each credential has its own verification transaction and status
- **Polling**: Application polls extras verification endpoint every 1 second
- **Return to Confirmation**: After successful verification, redirects back to confirmation page

### 5. Application Receipt Issuance
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
- Relations: JobPosting, IssuedCredentials, VerifiedCredentials

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