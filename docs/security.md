# Security notes

Tax documents are highly sensitive. Production deployments must enforce TLS, encryption at rest, RBAC, secure sessions, CSRF protection, rate limits, audit logs without financial values or PII, signed expiring download URLs, malware scanning, file authorization checks, secret management, CSP, retention controls, and permanent deletion. Uploaded tax data must not be sent to external AI providers unless the user explicitly opts in after a clear disclosure.
