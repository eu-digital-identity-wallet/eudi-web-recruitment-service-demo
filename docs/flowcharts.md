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
    O --> P{User Wants to Provide Extras?}
    P -->|Yes| Q[Redirect to /extras Page]
    P -->|No| R[User Clicks Sign Contract]
    Q --> T[Display QR for Additional Credentials]
    T --> U[User Scans with Wallet]
    U --> V[Wallet Shares Diploma/Seafarer Cert]
    V --> W[App Polls Extras Verification]
    W --> X{Extras Verified?}
    X -->|Yes| O
    X -->|No| W
    R --> Y[Generate Employment Contract PDF]
    Y --> Z[Create Signing Transaction]
    Z --> AA[Display Signing QR Code]
    AA --> AB[User Scans with Wallet]
    AB --> AC[Wallet Requests Signing JWT]
    AC --> AD[Wallet Downloads Document]
    AD --> AE[User Signs with QES]
    AE --> AF[Wallet Posts Signed Document]
    AF --> AG[App Polls Signing Status]
    AG --> AH{Document Signed?}
    AH -->|Yes| AI[Enable Issue Employee ID]
    AH -->|No| AG
    AI --> AJ[User Clicks Issue Employee ID]
    AJ --> AK[Display Credential Offer QR]
    AK --> AL[User Scans with Wallet]
    AL --> AM[Wallet Fetches Credential from EUDI Issuer]
    AM --> AN[End - Credential Stored in Wallet]
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

## 4. Document Signing Flow (QES)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant SignedDocRepo as SignedDocumentRepository
    participant PDFGen as ContractPdfGeneratorService
    participant DocSigning as DocumentSigningService
    participant JWTService
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Sign Contract" on confirmation page
    Browser->>App: POST /api/applications/{id}/sign-document

    App->>PDFGen: Generate employment contract PDF
    PDFGen-->>App: Return PDF bytes (Buffer)

    App->>DocSigning: initDocumentSigning(applicationId, pdf, type, label)
    DocSigning->>DocSigning: Generate state UUID and nonce
    DocSigning->>DocSigning: Calculate SHA-256 document hash
    DocSigning->>SignedDocRepo: Create SignedDocument (PENDING status)
    SignedDocRepo-->>DocSigning: Return signed document record
    DocSigning-->>App: Return state and documentHash

    App-->>Browser: Return state
    Browser->>Browser: Redirect to /applications/{id}/sign-contract
    Browser->>App: GET /api/applications/qr-sign/{id}
    App->>App: Build eudi-openid4vp:// URL with request_uri
    App->>App: Generate QR code
    App-->>Browser: Return QR code image

    Browser->>Browser: Display QR code to user
    User->>Wallet: Scan QR code with EUDI Wallet

    Wallet->>App: GET /api/request.jwt/{state}
    App->>DocSigning: prepareDocumentRetrievalRequest(state)
    DocSigning->>SignedDocRepo: findByState(state)
    SignedDocRepo-->>DocSigning: Return signed document record
    DocSigning-->>App: Return DocumentRetrievalAuthRequest payload
    App->>JWTService: Sign JWT with x5c certificate (ES256)
    JWTService-->>App: Return signed JWT
    App-->>Wallet: Return JWT (application/jwt)

    Wallet->>Wallet: Validate JWT and extract payload
    Wallet->>App: GET /api/documents/{state}
    App->>DocSigning: getDocumentForSigning(state)
    DocSigning->>SignedDocRepo: findByStateWithContent(state)
    SignedDocRepo-->>DocSigning: Return document with content
    DocSigning-->>App: Return PDF Buffer
    App-->>Wallet: Return PDF (application/pdf)

    Wallet->>Wallet: Verify document hash matches
    Wallet->>User: Request QES authorization
    User->>Wallet: Approve and sign with QES

    Wallet->>Wallet: Apply qualified electronic signature
    Wallet->>App: POST /api/signed-document/{state} (direct_post)
    Note over Wallet,App: Form data includes:<br/>- documentWithSignature (base64)<br/>- signatureObject<br/>- state

    App->>DocSigning: processSignedDocument(state, payload)
    DocSigning->>SignedDocRepo: updateByState(state, {status: SIGNED, ...})
    SignedDocRepo-->>DocSigning: Success
    DocSigning-->>App: Return {success: true}
    App-->>Wallet: Return success response

    loop Poll Every 1 Second
        Browser->>App: GET /api/applications/signing-status/{id}
        App->>DocSigning: checkSigningStatus(applicationId)
        DocSigning->>SignedDocRepo: findLatestByApplicationId(applicationId)
        SignedDocRepo-->>DocSigning: Return signing status
        DocSigning-->>App: Return {status, signedAt, errorCode}
        App-->>Browser: Return status

        alt Document Signed
            Browser->>Browser: Show "Issue Employee ID" button
            Browser->>Browser: Stop polling
        else Still Pending
            Browser->>Browser: Continue polling
        end
    end

    Note over User,Wallet: Document signed with QES<br/>User can now issue employee credential
```

## 5. Credential Issuance Flow

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

## 6. Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend (Next.js Pages)"
        A[Job List Page<br/>/jobs]
        B[Job Detail Page<br/>/jobs/id]
        C[Application Page<br/>/applications/id]
        D[Confirmation Page<br/>/applications/id/confirmation]
        E[Extras Page<br/>/applications/id/extras]
        F[Sign Contract Page<br/>/applications/id/sign-contract]
        G[Employee Page<br/>/applications/id/employee]
    end

    subgraph "API Routes"
        H[POST /api/applications/create]
        I[GET /api/applications/verification/id]
        J[GET /api/applications/qr/id]
        K[POST /api/applications/id/extras]
        L[GET /api/applications/qr-extras/id]
        M[GET /api/applications/verification-extras/id]
        N[POST /api/applications/id/sign-document]
        O[GET /api/applications/qr-sign/id]
        P[GET /api/applications/signing-status/id]
        Q[GET /api/request.jwt/state]
        R[GET /api/documents/state]
        S[POST /api/signed-document/state]
        T[GET /api/applications/qr-issue/id]
        U[POST /api/applications/id/issue-receipt]
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
        SG1[DocumentSigningService]
        SG2[ContractPdfGeneratorService]
        SG3[DocumentHashService]
    end

    subgraph "Repositories"
        V[ApplicationRepository]
        W[JobRepository]
        X[CredentialRepository]
        Y[VerifiedCredentialRepository]
        Z1[SignedDocumentRepository]
    end

    subgraph "External APIs"
        Z[EUDI Verifier API]
        AA[EUDI Issuer API]
    end

    subgraph "Database"
        AB[(PostgreSQL)]
    end

    A --> B --> C --> D --> E --> F --> G
    B --> H
    C --> I
    C --> J
    D --> K
    E --> L
    E --> M
    F --> N
    F --> O
    F --> P
    F --> Q
    F --> R
    F --> S
    G --> T
    D --> U

    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> SG1
    O --> SG1
    P --> SG1
    Q --> SG1
    R --> SG1
    S --> SG1
    T --> R
    U --> R

    O --> Q
    O --> V
    O --> Y
    P --> W
    Q --> V1
    Q --> S
    R --> I1
    R --> T
    R --> U
    SG1 --> SG2
    SG1 --> SG3
    SG1 --> Z1
    SG1 --> T

    V1 --> V2
    V1 --> V3
    V1 --> V4

    Q --> Z
    R --> AA

    V --> AB
    W --> AB
    X --> AB
    Y --> AB
    Z1 --> AB
```

## 7. Application State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: User applies for job

    CREATED --> CREATED: Polling verification status
    CREATED --> VERIFIED: PID verification successful

    VERIFIED --> VERIFIED: Request additional credentials
    VERIFIED --> VERIFIED: User provides extras (optional)
    VERIFIED --> SIGNING: User initiates contract signing

    SIGNING --> SIGNING: Polling signing status
    SIGNING --> SIGNED: Document signed with QES

    SIGNED --> ISSUED: User issues employee credential

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
        - Must sign contract before issuance
    end note

    note right of SIGNING
        - SignedDocument created (PENDING)
        - PDF contract generated
        - Document hash calculated
        - User scans QR with wallet
        - Wallet signs with QES
        - Polls every 1 second
    end note

    note right of SIGNED
        - SignedDocument status: SIGNED
        - Document with signature stored
        - Ready for credential issuance
    end note

    note right of ISSUED
        - Credential offer generated
        - Pre-authorized code created
        - User can claim credential
    end note
```

## 8. Database Schema Relationships

```mermaid
erDiagram
    JobPosting ||--o{ Application : "has many"
    Application ||--o{ IssuedCredential : "has many"
    Application ||--o{ VerifiedCredential : "has many"
    Application ||--o{ SignedDocument : "has many"

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

    SignedDocument {
        string id PK
        string applicationId FK
        string documentHash
        string documentType
        string documentLabel
        Bytes documentContent
        string state
        string nonce
        Bytes documentWithSignature
        string signatureObject
        string signatureQualifier
        string signerCertificate
        string status
        string errorCode
        DateTime signedAt
        DateTime createdAt
    }
```

## 9. Component Architecture

```mermaid
graph TD
    subgraph "Page Components"
        A[JobBoardPage<br/>/jobs]
        B[JobDetailPage<br/>/jobs/id]
        C[ApplicationPage<br/>/applications/id]
        D[ConfirmationPage<br/>/applications/id/confirmation]
        E[ExtrasPage<br/>/applications/id/extras]
        F[SignContractPage<br/>/applications/id/sign-contract]
        G[EmployeePage<br/>/applications/id/employee]
    end

    subgraph "Organism Components"
        H[AppLayout]
        I[Header]
        J[ReceiptIssuanceSection]
    end

    subgraph "Atom Components"
        K[JobIcon]
        L[ApplySameDeviceButton]
        M[ApplyCrossDeviceButton]
        N[VerificationPulse]
        O[AdditionalInfoActions]
        P[LogoBanner]
        Q[LogoBox]
        R[ApplicationVerificationPoller]
        S[ExtrasVerificationPoller]
        T[SigningStatusPoller]
        U[CredentialOfferDisplay]
        V[CredentialRequirementChips]
        W[IssueReceiptButton]
    end

    A --> H
    B --> H
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I

    B --> L
    B --> M
    C --> N
    C --> P
    C --> R
    D --> O
    D --> P
    D --> V
    E --> N
    E --> P
    E --> S
    F --> K
    F --> N
    F --> P
    F --> T
    G --> J
    G --> P

    J --> U
    J --> W

    P --> Q
    I --> P
```

## 10. CBOR Decoding Flow (VP Token Processing)

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

### Document Signing Flow (QES)

- Implements **Qualified Electronic Signature (QES)** using EUDI Wallet integration
- **Required step** before employee credential issuance
- **Contract Generation**:
  - Generates professional PDF employment contract using pdf-lib
  - Includes candidate information and job details
  - Calculates SHA-256 hash of document for integrity verification
- **Signing Process**:
  - Creates unique signing transaction with state UUID and nonce
  - Stores document content in **SignedDocument** table with PENDING status
  - Generates QR code with `eudi-openid4vp://` URL containing request_uri
  - Wallet retrieves signed JWT from `/api/request.jwt/{state}` endpoint
  - Wallet downloads document from `/api/documents/{state}` endpoint
  - Wallet verifies document hash matches
  - User authorizes and signs with Qualified Electronic Signature
  - Wallet posts signed document to `/api/signed-document/{state}` (direct_post mode)
- **Status Tracking**:
  - Browser polls `/api/applications/signing-status/{id}` every 1 second
  - SignedDocument status: PENDING → SIGNED (or FAILED on error)
  - Signed document with signature stored in database
  - "Issue Employee ID" button enabled only after successful signing
- **Security**:
  - Uses JWT with x5c certificate chain (ES256 algorithm)
  - Document hash verification ensures integrity
  - Signature qualifier: `eu_eidas_qes` (eIDAS Qualified Electronic Signature)
  - Hash algorithm: SHA-256 (OID: 2.16.840.1.101.3.4.2.1)

### Credential Issuance Flow

- Stores application data locally but uses **external EUDI issuer** for actual credential creation
- Uses **pre-authorized code** grant type (OpenID4VCI)
- Generates QR codes for wallet scanning
- Credential offer points to `dev.issuer.eudiw.dev`
- Stores issued credentials in **IssuedCredential** table with tracking
- **Only available after** contract has been signed with QES

### Architecture Pattern

- **Clean Architecture** with clear separation of concerns
- **Dependency Injection** using TypeDI
- **Repository Pattern** for data access with 5 repositories:
  - ApplicationRepository
  - JobRepository
  - CredentialRepository (for issued credentials)
  - VerifiedCredentialRepository (for verified credentials from wallet)
  - SignedDocumentRepository (for document signing workflows)
- **Service Layer** organized by domain:
  - **Verification Services** (`/services/verification/`):
    - `CredentialVerificationService` - Orchestrates verification workflows
    - `PidQueryService` - Builds DCQL queries for PID credentials
    - `DiplomaQueryService` - Builds DCQL queries for diploma credentials
    - `SeafarerQueryService` - Builds DCQL queries for seafarer credentials
  - **Issuance Services** (`/services/issuance/`):
    - `EmployeeCredentialService` - Builds employee credential data
  - **Signing Services** (`/services/signing/`):
    - `DocumentSigningService` - Orchestrates document signing workflows (QES)
    - `ContractPdfGeneratorService` - Generates professional PDF employment contracts
    - `DocumentHashService` - Calculates SHA-256 document hashes
  - **Core Services**:
    - `ApplicationService` - Orchestrates application lifecycle
    - `VerifierService` - EUDI verifier API integration
    - `IssuerService` - EUDI issuer API integration
    - `DataDecoderService` - CBOR/VP token decoding
    - `JWTService` - JWT signing with x5c certificates
    - `KeystoreService` - Keystore management
- **Input Validation** using Zod schemas with decorators
