---
name: booking-payments-reliability
description: Use only when implementing Strefa 29 version 2.0 bookings or payments after the owner approves capacity, prices, refund rules, and a payment provider. Do not use this skill for version 1.0.
disable-model-invocation: true
---

# Booking and payments reliability

Do not implement this during version 1.0.

Before any booking code:

- Confirm approved capacity, prices, refund rules, staff operations, and the payment provider.
- Keep availability checks and payment confirmation on the server.
- Use the provider's verified payment notification or server-side retrieval. Do not trust a browser redirect as proof of payment.
- Model concurrency so two groups cannot buy the same slot.
- Store provider ids and idempotency keys. Never store full card numbers.
- Add tests for pending, paid, failed, cancelled, and refunded states before exposing checkout.
