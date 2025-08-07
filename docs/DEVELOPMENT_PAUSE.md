# 🚨 DEVELOPMENT PAUSE NOTICE

## Authentication-Related Features

**STATUS**: ⏸️ **PAUSED** - Do not merge any auth-related PRs

### What's Paused
- New authentication features
- User management functionality
- Permission system changes
- Profile management updates
- Login/logout flow modifications
- Auth context modifications

### Why?
We're consolidating multiple overlapping authentication systems that are causing:
- Memory leaks from duplicate subscriptions
- Inconsistent user state
- Performance issues
- Complex debugging scenarios

### Current Auth Architecture Issues
```
❌ Multiple Auth Systems:
   - AuthContext.tsx
   - UserContext.tsx  
   - useAuthState.ts
   - useUserState()
   - Dev mode auth overlay

✅ Target: Single consolidated system
```

### What You CAN Work On
- ✅ UI components (non-auth related)
- ✅ Database schemas
- ✅ API integrations (Guesty, etc.)
- ✅ Analytics and reporting
- ✅ Inventory management
- ✅ Property management
- ✅ Housekeeping workflows
- ✅ Maintenance tasks

### When Will This Resume?
Estimated timeline: **2 weeks**

1. **Week 1**: Auth consolidation and cleanup
2. **Week 2**: Testing and migration
3. **Resume**: Normal auth development

### Need Auth Changes?
If you absolutely need auth-related changes:

1. **Discuss first** in team chat/standup
2. **Document the requirement** 
3. **Wait for consolidation** or risk significant rework

### Questions?
Contact the architecture team for guidance on:
- Whether your change affects auth
- Alternative approaches during the pause
- Timeline updates

---
**Last Updated**: [Current Date]  
**Next Review**: Check weekly for updates