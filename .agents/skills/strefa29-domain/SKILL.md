---
name: strefa29-domain
description: Use when changing Paintball Strefa 29 content, routes, inquiry flow, legal pages, or deciding whether work belongs to version 1.0 or 2.0.
---

# Strefa 29 domain

Version 1.0 is a Polish marketing and contact site. A form submission asks about a preferred date. It does not reserve a slot, take payment, or create a customer account.

Keep published routes working: `/`, `/oferta`, `/cennik`, `/galeria`, `/dla-kogo`, `/faq`, `/kontakt`, `/dojazd`, `/zapytaj-o-termin`, and the legal pages.

Do not invent company identity, prices, phone, email, reviews, photos, age rules, or legal terms. Missing facts go in `docs/BRAKI_DANYCH_DO_ZATWIERDZENIA.md`.

Audience slugs and inquiry event values differ. Use `eventTypeForAudience` before prefilling the form. Package ids must be one of the published packages or `nie-wiem`.
