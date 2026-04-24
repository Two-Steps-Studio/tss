# Roadmap

This document outlines the future development plans and priorities for Two Steps Studio.

## Table of Contents

- [Current Status](#current-status)
- [Phase 1: Security Hardening (Q2 2026)](#phase-1-security-hardening-q2-2026)
- [Phase 2: Feature Expansion (Q3 2026)](#phase-2-feature-expansion-q3-2026)
- [Phase 3: Platform Growth (Q4 2026)](#phase-3-platform-growth-q4-2026)
- [Phase 4: Advanced Features (2027)](#phase-4-advanced-features-2027)
- [Backlog](#backlog)
- [Vision](#vision)

## Current Status

**Version**: 1.0.0  
**Release Date**: 2026-03-13  
**Status**: Production ready, security fixes in progress

### Completed Features

- ✅ Web application with Next.js 15
- ✅ Discord bot with core features
- ✅ Supabase authentication
- ✅ Profile system with levels
- ✅ Economy system
- ✅ Basic shop
- ✅ Fishing game
- ✅ Events management

## Phase 1: Security Hardening (Q2 2026)

**Timeline**: April - June 2026  
**Priority**: Critical

### Security Improvements

#### Authentication
- [ ] Implement persistent rate limiting with Redis
- [ ] Add account lockout after failed login attempts
- [ ] Implement multi-factor authentication (MFA)
- [ ] Add email verification with code confirmation
- [ ] Implement session rotation
- [ ] Add captcha protection
- [ ] Implement brute force protection

#### API Security
- [ ] Add JWT verification to admin endpoints
- [ ] Implement API key rotation
- [ ] Add request signing
- [ ] Implement OAuth 2.0 flow
- [ ] Add API audit logging
- [ ] Implement API versioning
- [ ] Add deprecation warnings

#### Data Protection
- [ ] Implement end-to-end encryption for sensitive data
- [ ] Add data encryption at rest
- [ ] Implement PII masking
- [ ] Add automated data deletion
- [ ] Implement backup encryption
- [ ] Add security audit logging

#### Infrastructure
- [ ] Implement WAF (Web Application Firewall)
- [ ] Configure CSP (Content Security Policy) headers
- [ ] Enable HSTS (HTTP Strict Transport Security)
- [ ] Implement DDoS protection
- [ ] Add bot detection
- [ ] Implement CDN security

### Timeline

| Month | Tasks |
|-------|------|
| April | Rate limiting, lockout, email verification |
| May   | API security, data protection |
| June  | Infrastructure, testing |

## Phase 2: Feature Expansion (Q3 2026)

**Timeline**: July - September 2026  
**Priority**: High

### Web Application

#### New Features
- [ ] Mobile-responsive improvements
- [ ] Dark mode toggle
- [ ] Real-time notifications
- [ ] User notifications center
- [ ] Chat system
- [ ] Guild management
- [ ] Achievement system
- [ ] Leaderboards

#### Enhancements
- [ ] Improve accessibility (WCAG 2.1 AA)
- [ ] Add keyboard shortcuts
- [ ] Implement dark mode
- [ ] Improve mobile experience
- [ ] Add offline support
- [ ] Implement PWA features

### Discord Bot

#### New Features
- [ ] Additional game modes
- [ ] Mini-games collection
- [ ] Custom role creation
- [ ] Voice moderation tools
- [ ] Reaction roles
- [ ] Moderation commands
- [ ] Ticket system
- [ ] Level badges

#### Enhancements
- [ ] More voice events
- [ ] Improved profile cards
- [ ] Better gear system
- [ ] More events
- [ ] Auto-warmup for voice
- [ ] Better error handling

### Shop

#### New Items
- [ ] Custom server banners
- [ ] Special event items
- [ ] Limited-time offers
- [ ] Exclusive decorations
- [ ] Special badges
- [ ] Animated avatars

### Database

#### New Tables
- [ ] achievements table
- [ ] notifications table
- [ ] tickets table
- [ ] messages table
- [ ] logs table

## Phase 3: Platform Growth (Q4 2026)

**Timeline**: October - December 2026  
**Priority**: Medium

### Desktop Application

#### Features
- [ ] Native desktop app (Electron)
- [ ] Windows Store publish
- [ ] macOS App Store publish
- [ ] Linux Flatpak
- [ ] Offline mode
- [ ] Sync with cloud
- [ ] Multi-account support

### Mobile Application

#### Features
- [ ] iOS app (React Native)
- [ ] Android app (React Native)
- [ ] Push notifications
- [ ] Offline support
- [ ] Biometric authentication
- [ ] Cloud sync

### Community

#### Features
- [ ] Forum system
- [ ] Wiki/documentation
- [ ] Community Discord channel
- [ ] User showcase
- [ ] Creator program
- [ ] Affiliate program

#### Content
- [ ] Video tutorials
- [ ] Blog posts
- [ ] Live streams
- [ ] Community events
- [ ] Webinars

### Partnerships

- [ ] Discord partnerships
- [ ] Gaming platform integrations
- [ ] Payment gateway expansions
- [ ] Brand collaborations

## Phase 4: Advanced Features (2027)

**Timeline**: 2027  
**Priority**: Medium

### AI Features

- [ ] AI chatbot assistant
- [ ] Smart recommendations
- [ ] Content moderation
- [ ] Automated support
- [ ] Personalized suggestions
- [ ] Image generation for avatars

### Blockchain Integration

- [ ] NFT support
- [ ] Token economy
- [ ] Marketplace
- [ ] Cross-chain compatibility
- [ ] Minting capabilities

### Advanced Analytics

- [ ] User behavior analytics
- [ ] A/B testing
- [ ] Conversion tracking
- [ ] Funnel analysis
- [ ] Heatmaps
- [ ] User segmentation

### Enterprise Features

- [ ] Multi-tenant support
- [ ] Custom branding
- [ ] API access
- [ ] SLA guarantees
- [ ] Enterprise SSO
- [ ] Custom integrations

## Backlog

### Ideas to Consider

- [ ] Social features (friends, guilds)
- [ ] Tournament system
- [ ] Guild wars
- [ ] Custom server templates
- [ ] White-label option
- [ ] API marketplace
- [ ] Plugin system
- [ ] Webhook integrations
- [ ] Third-party apps
- [ ] Open beta program

### Deferred Features

- [ ] Dark mode (moved to Phase 2)
- [ ] Mobile app (moved to Phase 3)
- [ ] Desktop app (moved to Phase 3)
- [ ] AI features (moved to Phase 4)
- [ ] Blockchain (moved to Phase 4)

### Future Projects

- [ ] Open-source version
- [ ] SaaS product
- [ ] Mobile companion app
- [ ] Community platform
- [ ] Content management system
- [ ] Analytics dashboard
- [ ] Mobile SDK
- [ ] Desktop SDK

## Dependencies

### External Services

- **Supabase**: Database, auth, storage
- **Discord API**: Bot commands
- **Stripe**: Payments
- **Vercel**: Hosting (optional)
- **GitHub**: Version control
- **npm**: Package management

### Third-party Integrations

- Google Analytics
- Google Tag Manager
- Mailchimp (newsletter)
- Discord widget
- Discord OAuth
- Stripe Checkout

## Metrics & Goals

### 2026 Goals

- **Users**: 1,000+ registered users
- **Daily Active Users**: 100+ DAU
- **Bot Servers**: 1+ Discord server
- **Monthly Transactions**: 500+

### 2027 Goals

- **Users**: 5,000+ registered users
- **Daily Active Users**: 500+ DAU
- **Monthly Transactions**: 5,000+
- **Community**: 5,000+ members

### Technical Goals

- **Uptime**: 99.9% uptime
- **Performance**: <2s page load
- **Security**: Zero critical vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliant

## Resource Requirements

### Development

- **Developers**: 3-5 (full-time)
- **Designers**: 1-2 (part-time)
- **QA**: 1-2 (part-time)

### Infrastructure

- **VPS/Cloud**: 1-2 VPS instances
- **Database**: Supabase (paid tier)
- **Storage**: Supabase Storage
- **CDN**: Vercel CDN

### Budget

- **Initial**: $500-1,000/month
- **Growth**: $1,000-2,000/month
- **Expansion**: $2,000-5,000/month

## Success Criteria

### Phase 1 Success
- Zero critical vulnerabilities
- Rate limiting with Redis
- Email verification implemented
- 99% security audit pass rate

### Phase 2 Success
- Mobile-responsive design
- Improved accessibility score
- 10+ new bot features
- 50+ shop items

### Phase 3 Success
- Desktop app released
- Mobile app on stores
- 1,000+ active users
- Positive community feedback

### Phase 4 Success
- 5,000+ users
- 99.9% uptime
- Zero critical bugs
- Strong community engagement

## Feedback Loop

We gather feedback through:
- GitHub Issues
- Discord discussions
- User surveys
- Community forums
- Beta testing

## Contact

For feedback, questions, or contributions:
- GitHub: https://github.com/tss/tss
- Discord: Join our community
- Email: support@twostepsstudio.com

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|----------|---------|
| 1.0 | 2026-03-13 | Team | Initial roadmap |

## Contributing

Interested in helping with roadmap items?
- Check [CONTRIBUTING.md](./CONTRIBUTING.md)
- Create feature requests
- Join development discussions

---

**Last Updated**: 2026-03-13  
**Next Review**: 2026-06-13  
**Status**: Active Development  
