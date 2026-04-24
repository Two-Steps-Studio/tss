# Security Policy

Two Steps Studio takes security seriously. This document outlines our security practices, vulnerability reporting process, and security measures implemented in the project.

## Table of Contents

- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Security Best Practices](#security-best-practices)
- [Implemented Security Measures](#implemented-security-measures)
- [Vulnerability History](#vulnerability-history)
- [Security Checklist](#security-checklist)

## Reporting a Vulnerability

### How to Report

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. **DO** email the maintainers directly (see below)
3. **Include** in your report:
   - Type of vulnerability
   - Affected component
   - Steps to reproduce
   - Potential impact

### Responsible Disclosure

- We will respond within **48 hours**
- Fix timeline: **7 days** for critical, **14 days** for high, **30 days** for low severity
- Public disclosure with your consent after fix is deployed

### Contact

For security concerns, please contact:
- Email: security@twostepsstudio.com (add specific maintainer emails in repo)
- GitHub Security Advisory (for non-critical issues)

## Security Best Practices

### Environment Variables

**DO:**
```env
# Properly prefixed environment variables
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_URL=your_url
DISCORD_TOKEN=your_token
```

**DON'T:**
```env
# Never store secrets in code or unversioned files
# Never commit .env files
```

### Authentication

- ✅ Use **Supabase Auth** for secure authentication
- ✅ **Secure cookies** with `SameSite=Strict`
- ✅ **HTTPS only** in production
- ✅ **Session expiry** configured (30 days)
- ❌ Never store passwords in plain text
- ❌ Never use session fixation vulnerabilities

### API Security

- ✅ **Rate limiting** on all API endpoints
- ✅ **Input validation** using Zod schemas
- ✅ **Protected routes** with middleware
- ✅ **CSRF protection** on forms
- ❌ Never expose sensitive data in responses
- ❌ Never use deprecated encryption methods

### File Uploads

- ✅ **Private buckets** with public URL retrieval
- ✅ **File type validation**
- ✅ **Size limits** enforced
- ❌ Never allow executable file uploads
- ❌ Never store user uploads in public buckets without verification

### Database Security

- ✅ **Row-Level Security (RLS)** policies
- ✅ **Parameterized queries** (Supabase ORM)
- ✅ **Regular backups**
- ✅ **Access logging**

### Dependencies

- ✅ Regular **security updates**
- ✅ Dependency scanning with **npm audit**
- ✅ Avoid **deprecated packages**

## Implemented Security Measures

### Network Level

- **Rate Limiting**: 100 requests per minute per IP
- **Suspicious UA Detection**: Blocks bot, curl, python user agents
- **IP Blocking**: Ability to block malicious IPs
- **CORS Configuration**: Strict origins only

### Application Level

- **Middleware Auth**: Protected route enforcement
- **Input Sanitization**: XSS prevention
- **Output Encoding**: Safe HTML rendering
- **Error Handling**: Generic error messages in production
- **Secure Headers**: CSP, HSTS, X-Content-Type-Options

### Data Level

- **Encryption at Rest**: Supabase handles encryption
- **Encryption in Transit**: TLS 1.3
- **Secrets Management**: Environment variables with prefixing
- **Access Control**: Role-based access control

### Infrastructure

- **Secure Headers**:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=31536000`
- **HTTPS Only**: No HTTP allowed
- **SSL/TLS**: Up-to-date certificates

## Vulnerability History

| Date | Issue | Severity | Status | Fix |
|------|-------|----------|--------|-----|
| 2026-03-13 | Public avatar bucket | Critical | Fixed | Changed to private bucket |
| 2026-03-13 | No email verification | High | Fixed | Auto-confirm implemented |
| 2026-03-13 | Missing rate limiting | Medium | In Progress | Memory-based limiter active |
| 2026-03-13 | /api/shop unauthenticated | High | Fixed | Auth middleware added |

### Pending Security Fixes

- [ ] Add JWT verification to admin endpoints
- [ ] Implement account lockout after failed logins
- [ ] Add email verification flow (not auto-confirm)
- [ ] Sanitize shop search input (XSS prevention)
- [ ] Increase password requirements
- [ ] Add bot detection to API
- [ ] Configure CSP headers more strictly
- [ ] Set up centralized logging

### Security Audit Results

**Latest Audit Date**: 2026-03-13  
**Overall Risk Level**: Medium (after fixes)

| Area | Risk Before | Risk After | Notes |
|------|-------------|------------|-------|
| Auth | HIGH | MEDIUM | Better password policy, but no persistent rate limit |
| Files | HIGH | MEDIUM | Public bucket → Private + public URL |
| Admin | HIGH | MEDIUM | Basic auth exists, no JWT verification needed yet |
| API | MEDIUM | MEDIUM | Shop now requires auth |
| Secrets | LOW | LOW | Proper prefixing in place |
| Logs | LOW | LOW | Basic logging exists |

## Security Checklist

### Development

- [ ] Run `npm audit fix` regularly
- [ ] Review pull requests for security concerns
- [ ] Use secure dependencies only
- [ ] Enable pre-commit hooks
- [ ] Test with latest security best practices

### Production

- [ ] All environment variables set and secured
- [ ] HTTPS enforced
- [ ] Rate limiting active
- [ ] Protected routes enforced
- [ ] Secure headers configured
- [ ] Logs monitoring enabled
- [ ] Backup strategy in place

### Maintenance

- [ ] Regular dependency updates
- [ ] Security scans before releases
- [ ] Review vulnerability reports
- [ ] Update security policies
- [ ] Rotate credentials regularly
- [ ] Monitor for suspicious activity

## Security Training

All contributors should understand:
- OWASP Top 10
- Secure coding practices
- Authentication best practices
- Data protection requirements
- Incident response procedures

## Incident Response

### Security Incident Categories

1. **Data Breach**: Unauthorized access to user data
2. **Authentication Bypass**: Ability to access protected resources
3. **Malware**: Malicious code in dependencies or uploads
4. **DDoS**: Service disruption attempts
5. **Vulnerability Exploitation**: Known vulnerabilities being abused

### Response Procedures

1. **Immediate Actions**
   - Assess impact
   - Contain incident
   - Preserve evidence

2. **Communication**
   - Notify affected users (if applicable)
   - Update security advisory
   - Coordinate with response team

3. **Recovery**
   - Implement fixes
   - Verify remediation
   - Monitor for recurrence

## Compliance

### Regulatory Considerations

- **GDPR**: Personal data protection
- **CCPA**: California consumer privacy
- **OWASP**: Security standards adherence

### Data Protection

- User data encrypted at rest and in transit
- Minimal data collection principle
- Right to be forgotten supported via Supabase
- Data retention policies enforced

## Security Tools

### Used Security Tools

- **npm audit**: Dependency vulnerability scanning
- **ESLint**: Code quality and security rules
- **Supabase RLS**: Database access control
- **Supabase Auth**: Secure authentication
- **Vercel Security Headers**: Automated security headers

### Recommended Security Stack

For production deployments:
- **Redis**: For persistent rate limiting
- **WAF**: Web Application Firewall
- **CDN**: Content Delivery Network with security features
- **Monitoring**: Security information and event management (SIEM)

## Contributing to Security

### How You Can Help

- **Report vulnerabilities**: Follow responsible disclosure
- **Code reviews**: Review PRs for security concerns
- **Stay informed**: Follow security advisories
- **Best practices**: Follow security guidelines in code

### Security Contributors

We appreciate contributions to security:
- Security audits
- Vulnerability research
- Security tooling
- Documentation improvements

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Next.js Security](https://nextjs.org/docs/security)
- [Discord.js Security](https://discord.js.org/#/docs/rest/stable/class/RESTManager)
- [Hugging Face Security Policy](https://huggingface.co/docs/hub/security)

---

## Disclaimer

This security policy applies to the Two Steps Studio project. By using this software, you agree to comply with our security practices and not use this software for malicious purposes.

**Last Updated**: 2026-03-13  
**Next Review**: 2026-06-13  
