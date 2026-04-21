# Project Structure

## Industry Standard Monorepo Structure

```
resume-ai/
├── src/                          # Frontend React Application
│   ├── assets/                   # Static assets, images, fonts
│   ├── components/               # React components
│   │   ├── dashboard/            # ATS Dashboard components
│   │   ├── review/               # Resume review components
│   │   ├── upload/               # File upload components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── generator/            # Resume generator components
│   │   └── job-matcher/          # Job matching components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   ├── services/                 # API service clients
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Helper functions
│   ├── context/                  # React context providers
│   ├── styles/                   # Global styles and themes
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Application entry point
├── backend/                      # Node.js API Server
│   ├── src/
│   │   ├── api/                  # API route handlers
│   │   ├── lib/                  # Backend utilities
│   │   ├── types/                # Backend type definitions
│   │   └── scripts/              # Database seed and migration scripts
│   ├── dist/                     # Compiled backend output
│   └── package.json              # Backend dependencies
├── tests/                        # Test files
├── docs/                         # Documentation
├── public/                       # Public static assets
├── dist/                         # Built frontend output
├── scripts/                      # Project scripts
├── .env                          # Environment variables
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # Root TypeScript config
├── tsconfig.app.json             # Frontend TypeScript config
├── vite.config.ts                # Vite build config
└── README.md                     # Project README
```

## Key Features of This Structure

### Frontend Organization
- **Component Driven Architecture**: Each feature has its own component directory
- **Separation of Concerns**: Clear distinction between components, hooks, services, and utilities
- **Reusability**: UI components are isolated and reusable
- **Type Safety**: TypeScript types are centralized and imported consistently

### Backend Organization
- **API First Design**: Clean separation of API endpoints
- **Scriptable Operations**: Database seeds and migrations are version controlled
- **Type Safety**: Full TypeScript support on backend
- **Modular Architecture**: Easy to extend with new features

### Development Experience
- **Path Aliases**: `@/` imports for clean, maintainable imports
- **Consistent Tooling**: Same TypeScript version across frontend and backend
- **Build Optimization**: Vite for fast frontend builds
- **Proxy Configuration**: API proxy setup for seamless development

## Usage

### Frontend Development
```bash
npm run dev          # Starts frontend dev server on port 3000
npm run build        # Builds production frontend
```

### Backend Development
```bash
cd backend
npm run dev          # Starts backend dev server on port 3001
npm run build        # Builds production backend
npm run seed         # Seeds Pinecone database with sample resumes
```

### Database Seeding
```bash
cd backend
npm run seed         # Populates vector database with sample resumes
```

## Best Practices Followed

1. **Clear Directory Boundaries**: Each folder has a single, well-defined purpose
2. **Feature Organization**: Components grouped by feature rather than type
3. **Separation of Concerns**: Business logic separated from UI components
4. **Type Safety**: Full TypeScript coverage across entire stack
5. **Scalability**: Structure easily accommodates new features and growth
6. **Maintainability**: Consistent patterns make onboarding easy
7. **Testability**: Components and functions are isolated and testable
