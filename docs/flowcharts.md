# EUDI Web Recruitment Service - Application Flowcharts

## Table of Contents

1. [Overall Application Flow](#1-overall-application-flow)
2. [Hexagonal Architecture & Data Flow](#2-hexagonal-architecture--data-flow)
3. [Value Objects in Action](#3-value-objects-in-action)
4. [Device Detection Flow](#4-device-detection-flow)
5. [PID Verification Flow (Detail)](#5-pid-verification-flow-detail)
6. [Additional Credentials Verification Flow](#6-additional-credentials-verification-flow)
7. [Document Signing Flow (QES)](#7-document-signing-flow-qes)
8. [Credential Issuance Flow](#8-credential-issuance-flow)
9. [Data Flow Architecture](#9-data-flow-architecture)
10. [Application State Machine](#10-application-state-machine)
11. [Database Schema Relationships](#11-database-schema-relationships)
12. [Component Architecture](#12-component-architecture)
13. [CBOR Decoding Flow (VP Token Processing)](#13-cbor-decoding-flow-vp-token-processing)
14. [Key Points](#key-points)

## 1. Overall Application Flow

```mermaid
graph TD
    A[User Visits /vacancies] --> B[Browse Vacancy Listings]
    B --> C[Select Vacancy]
    C --> D[View Vacancy Details]
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
    N --> O[Display Finalization Page]
    O --> P{User Wants to Provide Qualifications?}
    P -->|Yes| Q[Redirect to /qualifications Page]
    P -->|No| R{User Wants Tax Residency?}
    R -->|Yes| R1[Redirect to /tax-residency Page]
    R -->|No| S[User Clicks Sign Contract]
    Q --> T[Display QR for Additional Credentials]
    T --> U[User Scans with Wallet]
    U --> V[Wallet Shares Diploma/Seafarer Cert]
    V --> W[App Polls Qualifications Verification]
    W --> X{Qualifications Verified?}
    X -->|Yes| O
    X -->|No| W
    R1 --> R2[Display QR for Tax Residency]
    R2 --> R3[User Scans with Wallet]
    R3 --> R4[App Polls Tax Residency Verification]
    R4 --> R5{Tax Residency Verified?}
    R5 -->|Yes| O
    R5 -->|No| R4
    S --> Y[Generate Employment Contract PDF]
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
    AJ --> AK[Redirect to /employee-qr Page]
    AK --> AL[Display Credential Offer QR]
    AL --> AM[User Scans with Wallet]
    AM --> AN[Wallet Fetches Credential from EUDI Issuer]
    AN --> AO[End - Credential Stored in Wallet]
```

## 2. Hexagonal Architecture & Data Flow

### Architectural Layers

```mermaid
graph TB
    subgraph "Interface Layer (Inbound Adapters)"
        HTTP[HTTP Requests]
        Routes[API Routes]
        Pages[Next.js Server Components]
    end

    subgraph "Application Layer (26 Use Cases)"
        subgraph "Inbound Ports"
            ICreateApp[ICreateApplicationUseCase]
            ICheckVerif[ICheckVerificationStatusUseCase]
            IRequestCreds[IRequestAdditionalCredentialsUseCase]
            IInitSigning[IInitiateDocumentSigningUseCase]
            IIssueEmployee[IIssueEmployeeIdUseCase]
            IGetPageData[IGet*PageDataUseCases]
        end

        subgraph "Use Cases"
            CreateApp[CreateApplicationUseCase]
            CheckVerif[CheckVerificationStatusUseCase]
            RequestCreds[RequestAdditionalCredentialsUseCase]
            InitSigning[InitiateDocumentSigningUseCase]
            IssueEmployee[IssueEmployeeIdUseCase]
            GetPageData[Get*PageDataUseCases]
        end

        subgraph "Outbound Ports"
            IAppRepo[IApplicationRepository]
            IVacRepo[IVacancyRepository]
            IVerifiedCredRepo[IVerifiedCredentialRepository]
            ISignedDocRepo[ISignedDocumentRepository]
            ICredRepo[ICredentialRepository]
            IVerifier[IVerifierPort]
            IIssuer[IIssuerPort]
            IKeystore[IKeystorePort]
        end
    end

    subgraph "Domain Layer"
        subgraph "Entities"
            Application[Application]
            Vacancy[Vacancy]
            VerifiedCred[VerifiedCredential]
            SignedDoc[SignedDocument]
            IssuedCred[IssuedCredential]
        end

        subgraph "Value Objects (30+)"
            CredType[CredentialType]
            AppId[ApplicationId]
            Email[Email]
            DocHash[DocumentHash]
            State[State]
            Nonce[Nonce]
        end

        subgraph "Domain Events"
            AppVerified[ApplicationVerified]
            QualVerified[QualificationVerified]
            DocSigned[DocumentSigned]
            CredIssued[CredentialIssued]
        end

        subgraph "Domain Services"
            JWTSvc[JWTService]
            CredDecoder[CredentialDecoderService]
            ContractSigning[ContractSigningService]
            PdfGen[ContractPdfGeneratorService]
        end
    end

    subgraph "Infrastructure Layer (Outbound Adapters)"
        AppRepo[PrismaApplicationRepositoryAdapter]
        VacRepo[PrismaVacancyRepositoryAdapter]
        VerifiedCredRepo[PrismaVerifiedCredentialRepositoryAdapter]
        SignedDocRepo[PrismaSignedDocumentRepositoryAdapter]
        CredRepo[PrismaIssuedCredentialRepositoryAdapter]
        VerifierAdapter[EudiVerifierAdapter]
        IssuerAdapter[EudiIssuerAdapter]
        KeystoreAdapter[JksKeystoreAdapter]
        EventDispatcher[InMemoryEventDispatcher]
        Prisma[(PostgreSQL)]
        EUDI[EUDI APIs]
    end

    HTTP --> Routes
    Routes --> ICreateApp
    Pages --> IGetPageData

    ICreateApp -.implements.- CreateApp
    ICheckVerif -.implements.- CheckVerif
    IRequestCreds -.implements.- RequestCreds
    IInitSigning -.implements.- InitSigning
    IIssueEmployee -.implements.- IssueEmployee
    IGetPageData -.implements.- GetPageData

    CreateApp --> IAppRepo
    CreateApp --> IVerifier
    CheckVerif --> IVerifiedCredRepo
    InitSigning --> ISignedDocRepo
    IssueEmployee --> IIssuer

    IAppRepo -.implements.- AppRepo
    IVacRepo -.implements.- VacRepo
    IVerifiedCredRepo -.implements.- VerifiedCredRepo
    ISignedDocRepo -.implements.- SignedDocRepo
    ICredRepo -.implements.- CredRepo
    IVerifier -.implements.- VerifierAdapter
    IIssuer -.implements.- IssuerAdapter
    IKeystore -.implements.- KeystoreAdapter

    AppRepo --> Prisma
    VacRepo --> Prisma
    VerifiedCredRepo --> Prisma
    SignedDocRepo --> Prisma
    CredRepo --> Prisma
    VerifierAdapter --> EUDI
    IssuerAdapter --> EUDI

    style Application fill:#e1f5ff
    style Vacancy fill:#e1f5ff
    style VerifiedCred fill:#e1f5ff
    style SignedDoc fill:#e1f5ff
    style IssuedCred fill:#e1f5ff
    style CredType fill:#fff4e1
    style AppId fill:#fff4e1
    style Email fill:#fff4e1
    style DocHash fill:#fff4e1
```

### Data Flow with Value Objects

```mermaid
sequenceDiagram
    participant API as API Route
    participant Ctrl as Controller
    participant UC as Use Case
    participant Entity as Domain Entity
    participant VO as Value Objects
    participant Mapper as Mapper
    participant Repo as Repository
    participant DB as Database

    Note over API,Ctrl: Interface Layer
    API->>Ctrl: HTTP POST {vacancyId: "abc123"}

    Note over Ctrl,UC: Application Layer Boundary
    Ctrl->>UC: execute({vacancyId: "abc123"})
    Note right of UC: Receives DTO (strings)

    UC->>VO: VacancyId.create("abc123")
    VO-->>UC: VacancyId instance
    Note right of VO: String � Value Object

    UC->>Repo: findById(VacancyId)
    Repo->>Mapper: toDomain(prismaVacancy)
    Mapper->>VO: CredentialType.fromString("DIPLOMA")
    VO-->>Mapper: CredentialType instance
    Mapper-->>Repo: Vacancy domain entity
    Repo-->>UC: Vacancy with Value Objects

    UC->>Entity: Application.create(vacancyId, appId)
    Note right of Entity: Entity uses Value Objects internally

    UC->>Repo: save(Application)
    Repo->>Mapper: toPersistence(Application)
    Mapper->>Entity: getId().getValue()
    Entity-->>Mapper: "abc123" (string)
    Note right of Mapper: Value Object � String
    Mapper-->>Repo: Prisma data (primitives)
    Repo->>DB: INSERT INTO applications...
```

## 3. Value Objects in Action

```mermaid
graph TD
    subgraph "Value Object Benefits"
        subgraph "Without Value Objects"
            A1[createApplication]
            A2["vacancyId: string"]
            A3["Could be any string!"]
            A4["'', 'invalid', null possible"]
        end

        subgraph "With Value Objects"
            B1[createApplication]
            B2["vacancyId: VacancyId"]
            B3["Validated on creation"]
            B4["Cannot be invalid"]
        end
    end

    A1 --> A2 --> A3 --> A4
    B1 --> B2 --> B3 --> B4

    style A4 fill:#ffcccc
    style B4 fill:#ccffcc
```

### Value Object Creation Flow

```mermaid
sequenceDiagram
    participant Client
    participant VO as VacancyId
    participant Validator

    Client->>VO: VacancyId.create("abc123")
    VO->>Validator: validate("abc123")

    alt Valid ID
        Validator-->>VO: true
        VO-->>Client: VacancyId instance
    else Invalid ID
        Validator-->>VO: false
        VO-->>Client: throws Error
    end

    Note over Client,Validator: Cannot create invalid VacancyId
```

## 4. Device Detection Flow

```mermaid
graph TD
    A[User Clicks Apply] --> B{Device Detection}
    B -->|Mobile Device| C[Same-Device Flow]
    B -->|Desktop| D[Cross-Device Flow]

    C --> E[Generate Deep Link URL]
    E --> F["eudi-openid4vp://verifier..."]
    F --> G[User Taps Deep Link]
    G --> H[EUDI Wallet Opens]
    H --> I[User Approves in Wallet]
    I --> J[Wallet Redirects Back]
    J --> K[App Receives Callback]

    D --> L[Generate QR Code]
    L --> M[Display QR Code]
    M --> N[User Scans with Mobile]
    N --> O[EUDI Wallet Opens on Phone]
    O --> P[User Approves in Wallet]
    P --> Q[Wallet Sends Response]
    Q --> R[App Polls for Result]

    K --> S[Process Verification]
    R --> S
    S --> T[Extract Personal Data]
    T --> U[Update Application]
```

### Page-Specific Use Cases

The application follows hexagonal architecture with dedicated use cases for each page:

```mermaid
graph LR
    subgraph "Next.js Pages"
        P1["applications/[id]<br/>PID Verification"]
        P2["applications/[id]/qualifications<br/>Professional Qualifications"]
        P3["applications/[id]/tax-residency<br/>Tax Residency"]
    end

    subgraph "Use Cases"
        U1[GetPIDVerificationPageDataUseCase]
        U2[GetQualificationsPageDataUseCase]
        U3[GetTaxResidencyPageDataUseCase]
    end

    subgraph "Responsibilities"
        R1["Fetch application data<br/>Access control<br/>Check PID credential exists<br/>Return page DTO"]
        R2["Fetch application data<br/>Access control<br/>Filter latest credentials<br/>Generate labels<br/>Return page DTO"]
        R3["Fetch application data<br/>Access control<br/>Check tax residency credential<br/>Return page DTO"]
    end

    P1 --> U1
    P2 --> U2
    P3 --> U3

    U1 -.encapsulates.- R1
    U2 -.encapsulates.- R2
    U3 -.encapsulates.- R3

    style U1 fill:#e1f5ff
    style U2 fill:#e1f5ff
    style U3 fill:#e1f5ff
```

**Benefits**:

- **Encapsulation**: All page logic in dedicated use cases
- **Testability**: Easy to test business logic without HTTP layer
- **Composition**: Use cases can call other use cases internally
- **Clean separation**: Pages handle HTTP, use cases handle business logic

## 5. PID Verification Flow (Detail)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant VerifiedCredRepo as VerifiedCredentialRepository
    participant Verifier as EUDI Verifier API
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Apply with EUDI Wallet"
    Browser->>App: POST /api/applications/create
    App->>App: Create Application (status: CREATED)
    App->>Verifier: Initialize verification session
    Verifier-->>App: Return transactionId, requestUri
    App->>VerifiedCredRepo: Create VerifiedCredential (PID, PENDING)
    App-->>Browser: Return applicationId, qrCodeUrl

    Browser->>Browser: Display QR Code
    User->>Wallet: Scan QR Code

    Wallet->>Verifier: Fetch presentation request
    Verifier-->>Wallet: Return DCQL query for PID
    Wallet->>User: Request consent for PID sharing
    User->>Wallet: Approve sharing
    Wallet->>Verifier: Submit VP token (CBOR-encoded mDoc)

    loop Every 1 second
        Browser->>App: GET /api/applications/[id]/verify-pid-status
        App->>Verifier: Check verification status
        alt Not yet verified
            Verifier-->>App: status: pending
            App-->>Browser: verified: false
        else Verified
            Verifier-->>App: status: success, vpToken
            App->>App: Decode CBOR VP token
            App->>App: Extract personal info from PID
            App->>App: Update Application (status: VERIFIED)
            App->>VerifiedCredRepo: Update credential (status: VERIFIED)
            App-->>Browser: verified: true, personalInfo
            Browser->>Browser: Redirect to finalization page
        end
    end
```

## 6. Additional Credentials Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant VerifiedCredRepo as VerifiedCredentialRepository
    participant Verifier as EUDI Verifier API
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Provide Additional Credentials"
    Browser->>App: POST /api/applications/[id]/verify-qualifications
    App->>Verifier: Initialize new verification session
    Note right of App: Separate session from PID verification
    Verifier-->>App: Return transactionId, requestUri
    App->>VerifiedCredRepo: Create VerifiedCredential (DIPLOMA/SEAFARER, PENDING)
    App-->>Browser: Return qrCodeUrl

    Browser->>Browser: Display QR Code on /qualifications page
    User->>Wallet: Scan QR Code

    Wallet->>Verifier: Fetch presentation request
    Verifier-->>Wallet: Return DCQL query for Diploma/Seafarer
    Wallet->>User: Request consent for credential sharing
    User->>Wallet: Approve sharing
    Wallet->>Verifier: Submit VP token

    loop Every 1 second
        Browser->>App: GET /api/applications/[id]/verify-qualifications-status
        App->>Verifier: Check verification status
        alt Not yet verified
            Verifier-->>App: status: pending
            App-->>Browser: verified: false
        else Verified
            Verifier-->>App: status: success, vpToken
            App->>App: Decode credential (SD-JWT or mDoc)
            App->>App: Extract credential data
            App->>VerifiedCredRepo: Update credential (status: VERIFIED)
            App-->>Browser: verified: true, credentialData
            Browser->>Browser: Redirect to finalization page
        end
    end
```

## 7. Document Signing Flow (QES)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant SignedDocRepo as SignedDocumentRepository
    participant PdfGen as ContractPdfGeneratorService
    participant HashSvc as DocumentHashService
    participant JWTSvc as JWTService
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Sign Contract"
    Browser->>App: POST /api/applications/[id]/sign-contract

    App->>PdfGen: Generate employment contract PDF
    PdfGen-->>App: PDF document (Bytes)

    App->>HashSvc: Calculate SHA-256 hash
    HashSvc-->>App: Document hash

    App->>App: Generate state UUID and nonce
    App->>SignedDocRepo: Create SignedDocument (PENDING)
    Note right of SignedDocRepo: Store: documentContent, hash, state, nonce

    App->>JWTSvc: Create signing request JWT
    Note right of JWTSvc: JWT contains: document hash, location, conformance level
    JWTSvc-->>App: Signed JWT with x5c certificate chain

    App-->>Browser: Return QR code URL

    Browser->>Browser: Display QR Code on /sign-contract page
    User->>Wallet: Scan QR Code

    Wallet->>App: GET /api/request.jwt/[state]
    App-->>Wallet: Return JWT signing request

    Wallet->>App: GET /api/documents/[state]
    App->>SignedDocRepo: Fetch document content
    SignedDocRepo-->>App: PDF document
    App-->>Wallet: Return PDF document

    Wallet->>Wallet: Verify document hash matches
    Wallet->>User: Request signature authorization
    User->>Wallet: Authorize with biometrics/PIN

    Wallet->>Wallet: Sign document with QES certificate
    Wallet->>App: POST /api/signed-document/[state]
    Note right of Wallet: Contains: signatureObject, signedDocument

    App->>SignedDocRepo: Update document (SIGNED)
    Note right of SignedDocRepo: Store: signatureObject, signerCertificate, signedDocument

    loop Every 1 second
        Browser->>App: GET /api/applications/[id]/sign-contract-status
        App->>SignedDocRepo: Check signing status
        alt Not yet signed
            SignedDocRepo-->>App: status: PENDING
            App-->>Browser: signed: false
        else Signed
            SignedDocRepo-->>App: status: SIGNED
            App-->>Browser: signed: true
            Browser->>Browser: Enable "Issue Employee ID" button
        end
    end
```

## 8. Credential Issuance Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as Application Service
    participant CredRepo as IssuedCredentialRepository
    participant EmpSvc as EmployeeCredentialService
    participant Issuer as EUDI Issuer API
    participant Wallet as EUDI Wallet

    User->>Browser: Click "Issue Employee ID"
    Browser->>App: POST /api/applications/[id]/issue-employee-id

    App->>EmpSvc: Build employee credential data
    Note right of EmpSvc: Contains: name, job title, application ID, etc.
    EmpSvc-->>App: Credential data object

    App->>Issuer: Request credential offer
    Note right of Issuer: OpenID4VCI pre-authorized code flow
    Issuer-->>App: Return credential offer URL, pre-authorized code

    App->>CredRepo: Create IssuedCredential record
    Note right of CredRepo: Store: preAuthorizedCode, credentialOfferUrl, credentialData

    App-->>Browser: Return credential offer QR code

    Browser->>Browser: Redirect to /employee-qr page
    Browser->>Browser: Display QR Code
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

## 9. Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend (Next.js Pages)"
        A[Vacancy List Page<br/>/vacancies]
        B[Vacancy Detail Page<br/>/vacancies/id]
        C[Application Page<br/>/applications/id]
        D[Qualifications Page<br/>/applications/id/qualifications]
        E[Tax Residency Page<br/>/applications/id/tax-residency]
        F[Finalize Page<br/>/applications/id/finalise]
        G[Sign Contract Page<br/>/applications/id/sign-contract]
        H[Employee Page<br/>/applications/id/employee]
        I[Employee QR Page<br/>/applications/id/employee-qr]
    end

    subgraph "API Routes"
        J[POST /api/applications/create]
        K["POST /api/applications/:id/verify-pid"]
        L["GET /api/applications/:id/verify-pid-status"]
        M["GET /api/applications/:id/qr-verify-pid"]
        N["POST /api/applications/:id/verify-qualifications"]
        O["GET /api/applications/:id/qr-verify-qualifications"]
        P["GET /api/applications/:id/verify-qualifications-status"]
        Q["POST /api/applications/:id/verify-tax-residency"]
        R["POST /api/applications/:id/sign-contract"]
        S["GET /api/applications/:id/qr-contract-signing"]
        T["GET /api/applications/:id/sign-contract-status"]
        U["GET /api/applications/:id/sign-contract-url"]
        V["GET /api/request.jwt/:state"]
        W["POST /api/documents/:state"]
        X["GET /api/signed-document/:state"]
        Y["GET /api/applications/:id/qr-issue-employee-id"]
        Z["POST /api/applications/:id/issue-employee-id"]
        AA["GET /api/applications/:id/deep-link"]
    end

    subgraph "Verification Services"
        V1[CredentialVerificationService]
        V2[PidQueryService]
        V3[DiplomaQueryService]
        V4[SeafarerQueryService]
        V5[TaxResidencyQueryService]
    end

    subgraph "Issuance Services"
        I1[EmployeeCredentialService]
    end

    subgraph "Signing Services"
        SG1[ContractSigningService]
        SG2[ContractPdfGeneratorService]
        SG3[DocumentHashService]
    end

    subgraph "Repository Adapters (Infrastructure)"
        RA1[PrismaApplicationRepositoryAdapter]
        RA2[PrismaVacancyRepositoryAdapter]
        RA3[PrismaIssuedCredentialRepositoryAdapter]
        RA4[PrismaVerifiedCredentialRepositoryAdapter]
        RA5[PrismaSignedDocumentRepositoryAdapter]
    end

    subgraph "External APIs"
        EA1[EUDI Verifier API]
        EA2[EUDI Issuer API]
    end

    subgraph "Database"
        DB[(PostgreSQL)]
    end

    A --> B --> C --> D
    C --> E
    C --> F --> G --> H --> I

    V1 --> V2
    V1 --> V3
    V1 --> V4
    V1 --> V5

    SG1 --> SG2
    SG1 --> SG3

    RA1 --> DB
    RA2 --> DB
    RA3 --> DB
    RA4 --> DB
    RA5 --> DB

    V1 --> EA1
    I1 --> EA2
```

## 10. Application State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: User applies for vacancy

    CREATED --> VERIFYING: PID verification initiated
    VERIFYING --> VERIFIED: PID verification successful
    VERIFYING --> ERROR: Verification failed

    VERIFIED --> QUALIFYING: User requests qualifications
    VERIFIED --> FINALIZED: User skips to finalization
    QUALIFYING --> QUALIFIED: Qualifications verified
    QUALIFYING --> ERROR: Qualification verification failed
    QUALIFIED --> FINALIZED: User proceeds to finalization

    FINALIZED --> SIGNING: User initiates contract signing
    SIGNING --> SIGNED: Document signed with QES
    SIGNING --> ERROR: Signing failed

    SIGNED --> ISSUING: User initiates credential issuance
    ISSUING --> ISSUED: Credential issued to wallet
    ISSUING --> ERROR: Issuance failed

    ISSUED --> ARCHIVED: Process complete
    ERROR --> REJECTED: Unrecoverable error
    ARCHIVED --> [*]
    REJECTED --> [*]

    note right of CREATED
        - Application record created
        - Ready for PID verification
    end note

    note right of VERIFYING
        - verifierTransactionId stored
        - User scans QR or uses deep link
        - Polls every 1 second
    end note

    note right of VERIFIED
        - Personal data extracted from PID
        - PID credential stored
        - Can request qualifications
    end note

    note right of QUALIFYING
        - Separate verification for diploma/seafarer
        - Tax residency attestation available
        - Independent polling per credential
    end note

    note right of FINALIZED
        - All optional credentials collected
        - Ready for contract signing
    end note

    note right of SIGNING
        - SignedDocument created (PENDING)
        - PDF contract generated
        - Document hash calculated
        - Wallet signs with QES
    end note

    note right of SIGNED
        - SignedDocument status: SIGNED
        - Document with signature stored
        - Ready for credential issuance
    end note

    note right of ISSUING
        - Credential offer generated
        - Pre-authorized code created
    end note

    note right of ISSUED
        - Employee credential in wallet
        - Process complete
    end note
```

## 11. Database Schema Relationships

```mermaid
erDiagram
    Vacancy ||--o{ Application : "has many"
    Application ||--o{ IssuedCredential : "has many"
    Application ||--o{ VerifiedCredential : "has many"
    Application ||--o{ SignedDocument : "has many"

    Vacancy {
        string id PK
        string title
        string description
        CredentialType[] requiredCredentials
        DateTime createdAt
    }

    Application {
        string id PK
        string vacancyId FK
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
        string preAuthorizedCode UK
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
        string state UK
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

## 12. Component Architecture

Following **Atomic Design** principles: Pages � Organisms � Molecules � Atoms

```mermaid
graph LR
    subgraph PAGES["PAGES (9)"]
        direction LR
        P1[VacancyListPage]
        P2[VacancyDetailPage]
        P3[ApplicationPage]
        P4[QualificationsVerificationPage]
        P5[TaxResidencyVerificationPage]
        P6[ApplicationFinalizationPage]
        P7[SignContractPage]
        P8[EmployeePage]
        P9[EmployeeQRPage]
    end

    subgraph ORGANISMS["ORGANISMS (13)"]
        direction LR
        O1[Header]
        O2[AppLayout]
        O3[VacancyListHeader]
        O4[VacancyApplicationSection]
        O5[ApplicationHeader]
        O6[EmployeeHeader]
        O7[PIDVerificationQR]
        O8[CredentialVerificationQR]
        O9[EmployeeQRSection]
        O10[ContractSigningSection]
        O11[ReceiptIssuanceSection]
        O12[ApplicationFinalizationContent]
        O13[EmployeeContent]
    end

    subgraph MOLECULES["MOLECULES (7)"]
        direction LR
        M1[VacancyCard]
        M2[VacancyDescription]
        M3[EmptyVacancyState]
        M4[PersonIdentificationInfo]
        M5[CredentialStatusDisplay]
        M6[ProfessionalQualificationsDisplay]
        M7[TaxResidencyDisplay]
    end

    subgraph ATOMS["ATOMS (20)"]
        direction LR
        A1[JobIcon]
        A2[ApplySameDeviceButton]
        A3[ApplyCrossDeviceButton]
        A4[CredentialRequirementChips]
        A5[CredentialOfferDisplay]
        A6[LogoBanner]
        A7[LogoBox]
        A8[VerificationPulse]
        A9[QualificationsVerificationPoller]
        A10[SigningStatusPoller]
        A11[IssueEmployeeIdButton]
        A12[SigningActions]
        A13[FinalizationActions]
        A14[TaxResidencyActions]
        A15[EmployeeIssuanceActions]
        A16[AdditionalInfoActions]
        A17[Field]
    end

    P1 --> O3
    P1 --> M3
    P2 --> O3
    P2 --> O4
    P3 --> O5
    P3 --> O7
    P4 --> O6
    P4 --> O8
    P5 --> O6
    P5 --> O8
    P6 --> O6
    P6 --> O12
    P7 --> O6
    P7 --> O10
    P8 --> O6
    P8 --> O13
    P9 --> O6
    P9 --> O9

    O3 --> M1
    O4 --> M2
    O5 --> M4
    O6 --> M4
    O13 --> O9
    O11 --> M6
    O10 --> M5
    O12 --> M5
    O12 --> M7

    M1 --> A1
    M1 --> A4
    M2 --> A2
    M2 --> A3
    O7 --> A7
    O8 --> A9
    O8 --> A7
    O9 --> A11
    O9 --> A15
    O10 --> A12
    O10 --> A10
    O12 --> A13
    M4 --> A17

    A12 --> A6
    A12 --> A8
    A12 --> A10
    A13 --> A14
    A14 --> A7
    A15 --> A7
    A16 --> A7
```

## 13. CBOR Decoding Flow (VP Token Processing)

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

## 14. Key Points

### Architecture Overview

- **Hexagonal Architecture** (Ports & Adapters) with **Domain-Driven Design (DDD)**
- **26 Use Cases** implementing business logic
- **5 Prisma Repository Adapters** for data persistence
- **2 HTTP Adapters** for EUDI Verifier and Issuer integration
- **Domain Events** for loose coupling (ApplicationVerified, QualificationVerified, DocumentSigned, CredentialIssued)
- **30+ Value Objects** for type-safe domain modeling
- **TypeDI** for dependency injection

### Verification Flow

- Uses **DCQL (Distributed Credential Query Language)** to request specific credential fields
- Supports both **same-device** (deep link) and **cross-device** (QR code) flows
- **Polls** verification status every 1 second for both PID and qualifications
- **Decodes multiple credential formats**:
  - **CBOR-encoded mDoc** (ISO/IEC 18013-5) VP tokens to extract personal information
  - **SD-JWT** (Selective Disclosure JWT) for privacy-preserving credential verification
- Stores all verified credentials in **VerifiedCredential** table with status tracking
- Supports multiple credential types: **PID** (always required), **DIPLOMA**, **SEAFARER**, and **TAXRESIDENCY** (optional)

### Multi-Stage Verification Process

1. **Initial PID Verification**: Required for all applications
   - Creates Application with CREATED status, transitions to VERIFYING
   - Stores PID verification transaction in VerifiedCredential table
   - Updates Application to VERIFIED status on success
   - Extracts candidate personal data (name, DOB, nationality, email, phone)

2. **Optional Professional Qualifications**: For jobs requiring additional credentials
   - User can choose to provide diploma and/or seafarer certificate
   - Application transitions to QUALIFYING status
   - Creates separate VerifiedCredential records for each credential type
   - Each credential has its own verification transaction and status
   - Verification happens on `/qualifications` page with dedicated QR code
   - On success, application transitions to QUALIFIED status

3. **Optional Tax Residency Attestation**: Available on finalization page
   - Requested before contract signing
   - Stores tax residency attestation in VerifiedCredential table
   - Separate verification flow with its own QR code
   - Available on `/tax-residency` page

### Application Status States

```
CREATED � VERIFYING � VERIFIED � QUALIFYING � QUALIFIED � FINALIZED � SIGNING � SIGNED � ISSUING � ISSUED � ARCHIVED
                  �                                                            �
                    ERROR � REJECTED
```

### Document Signing Flow (QES)

- Implements **Qualified Electronic Signature (QES)** using EUDI Wallet integration
- **Required step** before employee credential issuance
- Application transitions from FINALIZED � SIGNING � SIGNED
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
  - Browser polls `/api/applications/[id]/sign-contract-status` every 1 second
  - SignedDocument status: PENDING � SIGNED (or FAILED on error)
  - Signed document with signature stored in database
  - "Issue Employee ID" button enabled only after successful signing
- **Security**:
  - Uses JWT with x5c certificate chain (ES256 algorithm)
  - Document hash verification ensures integrity
  - Signature qualifier: `eu_eidas_qes` (eIDAS Qualified Electronic Signature)
  - Hash algorithm: SHA-256 (OID: 2.16.840.1.101.3.4.2.1)

### Credential Issuance Flow

- Application transitions from SIGNED � ISSUING � ISSUED
- Stores application data locally but uses **external EUDI issuer** for actual credential creation
- Uses **pre-authorized code** grant type (OpenID4VCI)
- Generates QR codes for wallet scanning on `/employee-qr` page
- Credential offer points to `dev.issuer.eudiw.dev`
- Stores issued credentials in **IssuedCredential** table with tracking
- **Only available after** contract has been signed with QES
- On completion, application can be transitioned to ARCHIVED status
