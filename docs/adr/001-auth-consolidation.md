# ADR-001: Authentication System Consolidation

## Status
Accepted

## Context
The current codebase has multiple overlapping authentication systems that create confusion, potential bugs, and maintenance overhead:

1. **AuthContext.tsx** - Central auth provider with Supabase integration
2. **UserContext.tsx** - Duplicate user management with complex state merging  
3. **useAuthState.ts** - Additional auth state management
4. **useUserState()** - Hook combining multiple auth sources
5. **Dev mode auth** - Mock authentication system intertwined with real auth

This has resulted in:
- Memory leaks from duplicate subscriptions
- Inconsistent user state across components
- Complex debugging due to multiple auth sources
- Performance issues from redundant API calls

## Decision
We will consolidate to a single authentication architecture:

1. **Primary**: Use `AuthContext.tsx` as the single source of truth for authentication
2. **Remove**: `UserContext.tsx` entirely - migrate functionality to AuthContext
3. **Simplify**: `useUserState()` to only complement AuthContext, not duplicate it
4. **Separate**: Dev mode authentication into isolated development utilities
5. **Standardize**: All auth operations through a single service layer

## Consequences

### Positive
- Single source of truth for user authentication state
- Eliminated duplicate API calls and subscriptions
- Simplified debugging and testing
- Reduced memory usage and improved performance
- Clearer code architecture for new developers

### Negative
- Significant refactoring effort required across multiple files
- Temporary development pause on auth-related features
- Risk of breaking existing functionality during migration
- Need to update all components using UserContext

## Implementation Notes

### Phase 1: Preparation
1. ❌ **HALT** all new auth-related feature development
2. Create comprehensive test coverage for existing auth flows
3. Document current auth behavior for regression testing

### Phase 2: Migration
1. Migrate UserContext functionality into AuthContext
2. Update all components importing from UserContext
3. Remove useUserState complex merging logic
4. Isolate dev mode authentication

### Phase 3: Cleanup
1. Delete UserContext.tsx and related files
2. Update imports across the codebase
3. Remove duplicate auth operation files
4. Add proper error boundaries for auth failures

### Breaking Changes
- All components using `useUser()` must switch to `useAuth()`
- Auth operation imports need updating
- Dev mode authentication API changes

## References
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Authentication Architecture Patterns](https://auth0.com/blog/authentication-patterns/)