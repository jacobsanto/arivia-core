# ADR-002: Console Logging Strategy

## Status
Accepted

## Context
The codebase currently contains 343+ console.log statements scattered throughout production code, including:

- Authentication flows with sensitive user data
- API responses with potentially private information
- Debug statements that clutter browser console in production
- Inconsistent logging patterns across components

This creates several problems:
- Performance overhead in production
- Potential security risks (data leakage)
- Poor user experience with cluttered console
- Debugging confusion with excessive log noise

## Decision
Implement a structured logging strategy:

1. **Remove all console.log statements** from production code
2. **Create a centralized logging service** with environment-based controls
3. **Use proper error handling** instead of console.error for user-facing errors
4. **Allow console statements only in**:
   - Test files (*.test.ts, *.spec.ts)
   - Development utilities (src/components/dev/*)
   - Development mode context

## Consequences

### Positive
- Cleaner production console
- Better performance (no unnecessary string interpolation)
- Enhanced security (no accidental data exposure)
- Professional user experience
- Centralized logging for better debugging

### Negative
- Initial effort to refactor existing code
- Developers need to learn new logging patterns
- Some debug information temporarily harder to access

## Implementation Notes

### ESLint Rule
```javascript
'no-console': ['error', { allow: ['warn', 'error'] }]
```

### Logging Service
Create `src/services/logger.ts`:
```typescript
class Logger {
  private isDev = import.meta.env.DEV;
  
  debug(message: string, data?: unknown) {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
  
  error(message: string, error?: Error) {
    // Always log errors, but sanitize in production
    console.error(message, this.isDev ? error : error?.message);
  }
}

export const logger = new Logger();
```

### Migration Steps
1. Run ESLint to identify all console.log violations
2. Replace with appropriate logging service calls
3. For auth flows: Replace with user-facing toast notifications
4. For errors: Use proper error boundaries and user feedback

### Exceptions
- Dev mode components can continue using console for development features
- Test files can use console for test debugging
- Build/deployment scripts can use console for CI/CD information

## References
- [Production Logging Best Practices](https://betterstack.com/community/guides/logging/javascript-logging-best-practices/)
- [ESLint no-console Rule](https://eslint.org/docs/latest/rules/no-console)