# EUDI Web Recruitment Service Demo

A demonstration of a modern recruitment platform that leverages **EU Digital Identity Wallet (EUDI)** technology for secure candidate verification and credential management.

## 🌟 Overview

This project showcases how traditional recruitment processes can be enhanced with digital identity verification and credential issuance capabilities using European Digital Identity Wallet standards. The platform enables employers to post jobs, candidates to apply using verified digital credentials, and facilitates secure credential verification and issuance.

## ✨ Key Features

### 🏢 For Employers
- **Job Management**: Create and manage job postings with detailed descriptions
- **Application Tracking**: Monitor application status through verification pipeline
- **Credential Verification**: Verify candidate credentials using EUDI wallet integration
- **Certificate Issuance**: Issue employment-related credentials to successful candidates

### 👤 For Candidates
- **Browse Jobs**: View available positions with detailed descriptions
- **Secure Application**: Apply using verified digital identity credentials
- **Multi-Device Support**: Same-device and cross-device verification flows
- **Credential Management**: Receive verifiable employment credentials

### 🔐 Security & Verification
- **Digital Identity Integration**: Full EUDI wallet compatibility
- **QR Code Verification**: Secure cross-device authentication flows
- **Personal Data Extraction**: Automated extraction from verified credentials
- **Multi-Step Verification**: Robust application status tracking (CREATED → VERIFIED → ISSUED)

## 🛠 Tech Stack

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

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
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

   # EUDI Integration
   VERIFIER_API_URL="https://your-verifier-api.com"
   ISSUER_API_URL="https://your-issuer-api.com"

   # Keystore Configuration
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
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── api/               # API routes
│   ├── jobs/              # Job listing pages
│   ├── applications/      # Application pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage (redirects to jobs)
├── components/            # Reusable UI components
│   ├── atoms/             # Basic components
│   └── organisms/         # Complex components
├── server/                # Server-side services and logic
└── theme.ts               # Material-UI theme configuration

prisma/
├── schema.prisma          # Database schema definition

development/               # Development utilities and scripts
```

## 🔄 Application Flow

1. **Job Discovery**: Candidates browse available job postings
2. **Application Initiation**: Candidate selects a job and chooses verification method
3. **Identity Verification**: EUDI wallet integration verifies candidate credentials
4. **Data Extraction**: Personal information extracted from verified credentials
5. **Application Processing**: Employer reviews verified application data
6. **Credential Issuance**: Successful candidates receive employment credentials

## 🧪 Development

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

## 🌐 API Integration

### EUDI Wallet Integration
The application integrates with EUDI-compliant verifier and issuer services:

- **Verifier API**: Handles credential verification requests
- **Issuer API**: Issues new credentials to verified candidates
- **Same-Device Flow**: Direct wallet integration on the same device
- **Cross-Device Flow**: QR code-based verification across devices

### Supported Credentials
- Personal Identity Documents
- Educational Diplomas
- Professional Certifications
- Employment History

## 📱 Mobile Compatibility

The application is fully responsive and supports mobile devices for:
- Job browsing and applications
- QR code scanning for cross-device verification
- Credential management and viewing

## 🔒 Security Considerations

- **Environment Variables**: Secure configuration management with Zod validation
- **Credential Verification**: Cryptographic verification of digital credentials
- **Data Privacy**: Minimal personal data retention, focused on verified attributes
- **Secure Communication**: HTTPS-only in production environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the EU Digital Identity Wallet initiative and follows applicable EU regulations and standards.

## 🆘 Support

For questions about EUDI wallet integration or technical issues:

1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Review [EUDI Wallet specifications](https://digital-strategy.ec.europa.eu/en/policies/eudi-wallet)
3. Open an issue in this repository

---

**Built with ❤️ for the EU Digital Identity ecosystem**