# Security Policy

## Supported Versions

Security fixes are applied to the latest version on the default branch.

## Reporting A Vulnerability

Please do not open a public GitHub issue for a suspected security vulnerability.

Instead, report it privately to the maintainer with:

- a short description of the issue
- impact and affected package(s)
- reproduction steps or proof of concept
- any suggested remediation if available

You should expect an acknowledgement and triage decision before public disclosure.

## Scope

This project depends heavily on third-party public APIs. Upstream outages, schema changes, and authentication policy changes are tracked as functional issues, not necessarily security vulnerabilities, unless they create a confidentiality, integrity, or availability risk inside this project itself.

Because the main public distribution target is npm, reports about:

- package tampering
- unexpected runtime downloads
- credential leakage
- unsafe child process behavior
- supply-chain issues in published artifacts

should be treated as security reports and sent privately.
