# Project conventions
- Access configuration uses catalog-validated `module.feature.action` strings for role permissions and explicit administrator `permissions`; the external REST server must persist and enforce these grants, and administrator status must not bypass them.
- Role creation entry points share one React Hook Form-controlled access selector to keep validation and request shape consistent.
- Both global notification renderers sanitize text through the shared Persian notification helper; Radix toast IDs are assigned once by the caller so dismissal and updates target the same record.