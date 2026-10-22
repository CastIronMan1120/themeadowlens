---
name: Sanity CRM Protocol
description: Strict rules regarding the Contact Form and Email pipelines.
---
Never attempt to install or use third-party email providers (Resend, SendGrid, SMTP) for The Meadow Lens.
The website's contact form (`/api/inquire`) is strictly a Sanity CRM pipeline that writes `lead` documents directly to the Sanity Cloud database (`Inquiry Leads (CRM)` in `/studio`).
All inquiries are managed exclusively within the Sanity Admin Studio, and the official studio email on file is `dmc1120@themeadowlens.com`.
