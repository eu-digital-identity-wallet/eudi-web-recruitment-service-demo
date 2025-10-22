# EUDI Web Recruitment Service - Application Flowcharts

## 1. Overall Application Flow

```mermaid
graph TD
    A[User Visits /jobs] --> B[Browse Job Listings]
    B --> C[Select Job]
    C --> D[View Job Details]
    D --> E[Click Apply]
    E --> F[Choose Verification Method]
    F --> G{Same Device or Cross Device?}
    G -->|Same Device| H[Deep Link to Wallet]
    G -->|Cross Device| I[Display QR Code]
    H --> J[Wallet Verifies PID]
    I --> J
    J --> K[User Shares PID Data]
    K --> L[App Polls Verification Status]
    L --> M{PID Verified?}
    M -->|Yes| N[Extract Personal Data]
    M -->|No| L
    N --> O[Display Confirmation Page]
    O --> P{Job Requires Extra Credentials?}
    P -->|Yes| Q[Display Request Additional Credentials]
    P -->|No| S[Issue Application Receipt]
    Q --> R{User Wants to Provide?}
    R -->|Yes| T[Redirect to /extras Page]
    R -->|No| S
    T --> U[Display QR for Additional Credentials]
    U --> V[User Scans with Wallet]
    V --> W[Wallet Shares Diploma/Seafarer Cert]
    W --> X[App Polls Extras Verification]
    X --> Y{Extras Verified?}
    Y -->|Yes| S
    Y -->|No| X
    S --> Z[Display Credential Offer QR]
    Z --> AA[User Scans with Wallet]
    AA --> AB[Wallet Fetches Credential from EUDI Issuer]
    AB --> AC[End - Credential Stored in Wallet]
```

## 2. PID Verification Flow (Detail)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant VerifiedCredRepo as VerifiedCredentialRepository
    participant Verifier as EUDI Verifier API
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Apply for Job"
    Browser->>App: POST /api/applications/create
    App->>Verifier: POST /ui/presentations (DCQL query for PID)
    Verifier-->>App: Return {client_id, request_uri, transaction_id}
    App->>VerifiedCredRepo: Create VerifiedCredential (PID, PENDING)
    App->>App: Create verification URL
    App-->>Browser: Return application ID

    alt Same Device Flow
        Browser->>Wallet: Open eudi-openid4vp:// deep link
    else Cross Device Flow
        Browser->>Browser: Display QR Code
        User->>Wallet: Scan QR Code
    end

    Wallet->>Verifier: Fetch presentation request
    Wallet->>User: Request consent for PID data sharing
    User->>Wallet: Approve
    Wallet->>Verifier: Submit VP token (mDoc)

    loop Poll Every 1 Second
        Browser->>App: GET /api/applications/verification/{id}
        App->>Verifier: GET /ui/presentations/{transactionId}
        Verifier-->>App: Return VP token or pending
        alt Verified
            App->>App: Decode CBOR VP token
            App->>App: Extract personal info from mDoc
            App->>VerifiedCredRepo: Update status to VERIFIED, store data
            App->>App: Update application status to VERIFIED
            App->>App: Store candidate info in Application
            App-->>Browser: Return {verified: true, personalInfo}
            Browser->>Browser: Redirect to confirmation page
        else Pending
            App-->>Browser: Return {verified: false}
        end
    end
```

## 3. Additional Credentials Verification Flow (Extras)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant VerifiedCredRepo as VerifiedCredentialRepository
    participant Verifier as EUDI Verifier API
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Provide Additional Credentials"
    Browser->>App: POST /api/applications/{id}/extras
    Note over Browser,App: Request includes credential types:<br/>DIPLOMA, SEAFARER, or BOTH

    App->>Verifier: POST /ui/presentations (DCQL for diploma/seafarer)
    Verifier-->>App: Return {client_id, request_uri, transaction_id}
    App->>VerifiedCredRepo: Create VerifiedCredential records (PENDING)
    App->>App: Create extras verification URL
    App-->>Browser: Redirect to /applications/{id}/extras

    Browser->>Browser: Display QR Code
    User->>Wallet: Scan QR Code

    Wallet->>Verifier: Fetch presentation request
    Wallet->>User: Request consent for diploma/seafarer data
    User->>Wallet: Approve
    Wallet->>Verifier: Submit VP token (mDoc)

    loop Poll Every 1 Second
        Browser->>App: GET /api/applications/verification-extras/{id}
        App->>Verifier: GET /ui/presentations/{transactionId}
        Verifier-->>App: Return VP token or pending
        alt Verified
            App->>App: Decode CBOR VP token
            App->>App: Extract credential data
            App->>VerifiedCredRepo: Update status to VERIFIED, store data
            App-->>Browser: Return {status: true}
            Browser->>Browser: Redirect to confirmation page
        else Pending
            App-->>Browser: Return {status: false}
        end
    end
```

## 4. Credential Issuance Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant CredRepo as CredentialRepository
    participant Issuer as EUDI Issuer API
    participant Wallet as EUDI Wallet

    User->>Browser: Navigate to /applications/{id}/employee
    Browser->>App: GET /api/applications/qr-issue/{id}
    App->>App: Validate application is VERIFIED

    App->>App: Generate preAuthorizedCode
    App->>App: Build credential data (employee_mdoc)
    App->>CredRepo: Store IssuedCredential with data
    App->>App: Create credential offer object
    App->>App: Encode as openid-credential-offer:// URL
    App->>App: Generate QR code (SVG)
    App-->>Browser: Return QR code image

    Browser->>Browser: Display QR code to user
    User->>Wallet: Scan QR code

    Wallet->>Wallet: Parse credential offer
    Wallet->>Issuer: GET /.well-known/openid-credential-issuer
    Issuer-->>Wallet: Return issuer metadata

    Wallet->>Issuer: POST /credential (with pre-authorized code)
    Issuer->>Issuer: Validate code
    Issuer->>Issuer: Create & sign mDoc credential
    Issuer-->>Wallet: Return signed credential

    Wallet->>Wallet: Store credential
    Wallet->>User: Show success notification

    Note over User,Wallet: Credential now available in wallet<br/>for future presentations
```

## 5. Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend (Next.js Pages)"
        A[Job List Page<br/>/jobs]
        B[Job Detail Page<br/>/jobs/id]
        C[Application Page<br/>/applications/id]
        D[Confirmation Page<br/>/applications/id/confirmation]
        E[Extras Page<br/>/applications/id/extras]
        F[Employee Page<br/>/applications/id/employee]
    end

    subgraph "API Routes"
        G[POST /api/applications/create]
        H[GET /api/applications/verification/id]
        I[GET /api/applications/qr/id]
        J[POST /api/applications/id/extras]
        K[GET /api/applications/qr-extras/id]
        L[GET /api/applications/verification-extras/id]
        M[GET /api/applications/qr-issue/id]
        N[POST /api/applications/id/issue-receipt]
    end

    subgraph "Services Layer"
        O[ApplicationService]
        P[JobService]
        Q[VerifierService]
        R[IssuerService]
        S[DataDecoderService]
        T[JWTService]
        U[KeystoreService]
    end

    subgraph "Verification Services"
        V1[CredentialVerificationService]
        V2[PidQueryService]
        V3[DiplomaQueryService]
        V4[SeafarerQueryService]
    end

    subgraph "Issuance Services"
        I1[EmployeeCredentialService]
    end

    subgraph "Signing Services"
        S1[DocumentSigningService]
    end

    subgraph "Repositories"
        V[ApplicationRepository]
        W[JobRepository]
        X[CredentialRepository]
        Y[VerifiedCredentialRepository]
    end

    subgraph "External APIs"
        Z[EUDI Verifier API]
        AA[EUDI Issuer API]
    end

    subgraph "Database"
        AB[(PostgreSQL)]
    end

    A --> B --> C --> D --> E --> F
    B --> G
    C --> H
    C --> I
    D --> J
    E --> K
    E --> L
    F --> M
    D --> N

    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> R
    N --> R

    O --> Q
    O --> V
    O --> Y
    P --> W
    Q --> V1
    Q --> S
    R --> I1
    R --> T
    R --> U

    V1 --> V2
    V1 --> V3
    V1 --> V4

    Q --> Z
    R --> AA

    V --> AB
    W --> AB
    X --> AB
    Y --> AB
```

## 6. Application State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: User applies for job

    CREATED --> CREATED: Polling verification status
    CREATED --> VERIFIED: PID verification successful

    VERIFIED --> VERIFIED: Request additional credentials
    VERIFIED --> ISSUED: Application receipt issued

    ISSUED --> [*]: Process complete

    note right of CREATED
        - verifierTransactionId stored
        - User scans QR or uses deep link
        - Polls every 1 second
    end note

    note right of VERIFIED
        - Personal data extracted from PID
        - PID credential always verified
        - Can request diploma/seafarer cert
        - Ready for credential issuance
    end note

    note right of ISSUED
        - Credential offer generated
        - Pre-authorized code created
        - User can claim credential
    end note
```

## 7. Database Schema Relationships

```mermaid
erDiagram
    JobPosting ||--o{ Application : "has many"
    Application ||--o{ IssuedCredential : "has many"
    Application ||--o{ VerifiedCredential : "has many"

    JobPosting {
        string id PK
        string title
        string description
        CredentialType requiredCredentials
        DateTime createdAt
    }

    Application {
        string id PK
        string jobId FK
        ApplicationStatus status
        string candidateFamilyName
        string candidateGivenName
        string candidateDateOfBirth
        string candidateNationality
        string candidateEmail
        string candidateMobilePhone
        DateTime createdAt
        DateTime updatedAt
    }

    IssuedCredential {
        string id PK
        string applicationId FK
        string preAuthorizedCode
        string credentialOfferUrl
        string otp
        string credentialType
        Json credentialData
        boolean claimed
        DateTime claimedAt
        DateTime expiresAt
        DateTime createdAt
    }

    VerifiedCredential {
        string id PK
        string applicationId FK
        CredentialType credentialType
        string namespace
        string verifierTransactionId
        string verifierRequestUri
        Json credentialData
        string status
        DateTime verifiedAt
        DateTime createdAt
    }
```

## 8. Component Architecture

```mermaid
graph TD
    subgraph "Page Components"
        A[JobBoardPage<br/>/jobs]
        B[JobDetailPage<br/>/jobs/id]
        C[ApplicationPage<br/>/applications/id]
        D[ConfirmationPage<br/>/applications/id/confirmation]
        E[ExtrasPage<br/>/applications/id/extras]
        F[EmployeePage<br/>/applications/id/employee]
    end

    subgraph "Organism Components"
        G[AppLayout]
        H[Header]
        I[ReceiptIssuanceSection]
    end

    subgraph "Atom Components"
        J[JobIcon]
        K[ApplySameDeviceButton]
        L[ApplyCrossDeviceButton]
        M[VerificationPulse]
        N[AdditionalInfoActions]
        O[LogoBanner]
        P[LogoBox]
        Q[ApplicationVerificationPoller]
        R[ExtrasVerificationPoller]
        S[CredentialOfferDisplay]
        T[CredentialRequirementChips]
        U[IssueReceiptButton]
    end

    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G

    G --> H

    B --> K
    B --> L
    C --> M
    C --> O
    C --> Q
    D --> N
    D --> O
    D --> T
    E --> M
    E --> O
    E --> R
    F --> I
    F --> O

    I --> S
    I --> U

    O --> P
    H --> O
```

## 9. CBOR Decoding Flow (VP Token Processing)

```mermaid
graph TD
    A[Receive VP Token from Verifier] --> B{Is Array?}
    B -->|Yes| C[Extract First Element]
    B -->|No| D[Use Token Directly]
    C --> E[Base64/Hex Decode]
    D --> E
    E --> F[CBOR Decode to Object]
    F --> G[Navigate to documents array]
    G --> H[Access issuerSigned.nameSpaces]
    H --> I[Find namespace: eu.europa.ec.eudi.pid.1]
    I --> J[Iterate Through Elements]
    J --> K[CBOR Decode Each Element]
    K --> L[Extract elementIdentifier & elementValue]
    L --> M{Special Handling Needed?}
    M -->|birth_date| N[Extract from CBOR Tagged Object]
    M -->|nationality| O[Handle Array/Object Format]
    M -->|other| P[Use Value Directly]
    N --> Q[Build Personal Info Object]
    O --> Q
    P --> Q
    Q --> R{Has family_name & given_name?}
    R -->|Yes| S[Return Success with Data]
    R -->|No| T[Return Failure]
```

## Key Points

### Verification Flow

- Uses **DCQL (Distributed Credential Query Language)** to request specific credential fields
- Supports both **same-device** (deep link) and **cross-device** (QR code) flows
- **Polls** verification status every 1 second for both PID and extras
- Decodes **CBOR-encoded mDoc** VP tokens to extract personal information
- Stores all verified credentials in **VerifiedCredential** table with status tracking
- Supports multiple credential types: **PID** (always required), **DIPLOMA**, and **SEAFARER** (optional)

### Two-Stage Verification Process

1. **Initial PID Verification**: Required for all applications
   - Creates Application with CREATED status
   - Stores PID verification transaction in VerifiedCredential table
   - Updates Application to VERIFIED status on success
   - Extracts candidate personal data (name, DOB, nationality, email, phone)

2. **Optional Extras Verification**: For jobs requiring additional credentials
   - User can choose to provide diploma and/or seafarer certificate
   - Creates separate VerifiedCredential records for each credential type
   - Each credential has its own verification transaction and status
   - Verification happens on separate `/extras` page with new QR code

### Credential Issuance Flow

- Stores application data locally but uses **external EUDI issuer** for actual credential creation
- Uses **pre-authorized code** grant type (OpenID4VCI)
- Generates QR codes for wallet scanning
- Credential offer points to `dev.issuer.eudiw.dev`
- Stores issued credentials in **IssuedCredential** table with tracking

### Architecture Pattern

- **Clean Architecture** with clear separation of concerns
- **Dependency Injection** using TypeDI
- **Repository Pattern** for data access with 4 repositories:
  - ApplicationRepository
  - JobRepository
  - CredentialRepository (for issued credentials)
  - VerifiedCredentialRepository (for verified credentials from wallet)
- **Service Layer** organized by domain:
  - **Verification Services** (`/services/verification/`):
    - `CredentialVerificationService` - Orchestrates verification workflows
    - `PidQueryService` - Builds DCQL queries for PID credentials
    - `DiplomaQueryService` - Builds DCQL queries for diploma credentials
    - `SeafarerQueryService` - Builds DCQL queries for seafarer credentials
  - **Issuance Services** (`/services/issuance/`):
    - `EmployeeCredentialService` - Builds employee credential data
  - **Signing Services** (`/services/signing/`):
    - `DocumentSigningService` - Handles document signing workflows (QES)
  - **Core Services**:
    - `ApplicationService` - Orchestrates application lifecycle
    - `VerifierService` - EUDI verifier API integration
    - `IssuerService` - EUDI issuer API integration
    - `DataDecoderService` - CBOR/VP token decoding
    - `JWTService` - JWT signing
    - `KeystoreService` - Keystore management
- **Input Validation** using Zod schemas with decorators
