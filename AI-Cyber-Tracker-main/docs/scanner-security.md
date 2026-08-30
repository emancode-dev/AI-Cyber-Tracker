# Safe scanner boundaries — Days 16–20

The backend scanner code is real, but no public scan-start API route is exposed yet. Day 21 is where rate limiting, endpoint protection, authorization wording, request-size rules, and persistence are added.

Implemented defenses/concepts:
- Only HTTP/HTTPS URLs.
- No embedded URL credentials.
- Port allow-list (default 80/443).
- DNS resolution before each request.
- Private, loopback, link-local, documentation, multicast and other non-public IP ranges blocked.
- DNS result pinned into the Node request lookup callback to reduce DNS-rebinding exposure for that request.
- Redirect destinations are independently revalidated.
- Maximum redirect count.
- Request timeout and response-body byte cap.
- Passive GET requests only; no form submission, credential testing, brute force, destructive actions or exploit attempts.
- Cookie findings never store raw cookie values.
- Debug/error pattern matches are labeled low-confidence manual review rather than confirmed vulnerabilities.

To test from the terminal, only use a target you own or are authorized to assess:

```bash
cd server
# Put these in server/.env
SCANNER_CONFIRM_AUTHORIZED=true
SCANNER_TEST_URL=https://your-authorized-test-site.example
npm run scanner:test
```
