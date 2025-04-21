
# Arivia Villas All-in-One Operations App

## Project Overview

The Arivia Villas Operations Application is a comprehensive platform designed to streamline villa property management operations, enabling both staff and villa owners to efficiently manage properties, tasks, inventory, and financials.

**URL**: https://lovable.dev/projects/57c4596f-bf34-4143-b817-b833cee798ef

## Core Features

- **Operations Task Management**: Cleaning, maintenance scheduling and tracking
- **Inventory Management**: Stock tracking across general storage and per-villa inventory
- **Financial Dashboard**: Expenses, reports, and per-villa profitability tracking
- **Calendar & Booking Integration**: Seamless sync with Guesty booking platform
- **Team Communication**: Built-in chat system for staff coordination

## Technology Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **State Management**: React Context API, TanStack Query
- **Database & Authentication**: Supabase
- **Hosting & Deployment**: 
- **Integrations**: Guesty API, Stripe payment processing

## Local Development

### Prerequisites

- Node.js 18+ - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm 9+

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd arivia-villas-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GUESTY_API_URL=your_guesty_api_url
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Deployment

<!-- Netlify-specific deployment and environment variable setup info has been removed. Add your own hosting/deployment instructions as needed. -->

## Best Practices for GitHub

1. **Branch Management**:
   - `main`: Production-ready code
   - `development`: Integration branch for ongoing development
   - Feature branches: Create from development (format: `feature/feature-name`)

2. **Commit Guidelines**:
   - Use descriptive commit messages
   - Reference issue numbers when applicable
   - Keep commits focused on single changes

3. **Pull Request Process**:
   - Create PRs from feature branches to development
   - Use PR template for consistent documentation
   - Require code review before merging

## Documentation

Additional documentation:

- [API Integration Guide](./src/integrations/guesty/README.md)
- [Guesty API Reference](./src/integrations/guesty/api-reference.md)

## Important Files to Exclude from Version Control

Note: In addition to the patterns in the existing `.gitignore`, make sure to exclude:

- Local environment files (`.env.local`, `.env.development.local`)
- Log files and debugging outputs
- Temporary build files
- Service account keys and credentials

## License

This project is proprietary software owned by Arivia Villas.
