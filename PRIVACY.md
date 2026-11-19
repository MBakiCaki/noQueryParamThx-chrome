# Privacy and source-package review

Applies to **Temiz Bağlantı 0.2.1**. Reviewed **2026-11-19**. This describes the shipped source, not Chrome's or destination websites' privacy practices.

## Data processed

| Data | Purpose and destination |
| --- | --- |
| Trusted mouse events, button number, and modifier flags | Recognize the gesture in the originating page/frame |
| Link `href` and base URL | Resolve and clean the selected HTTP(S) target locally |
| Pinterest hostname/path, visit labels/attributes, exposed outbound links | Resolve the supported Visit button locally |
| Cleaned URL and originating tab/window metadata supplied by Chrome | Request a background tab through Chrome's extension messaging |
| Last original URL, cleaned URL, and open result | Keep status in document memory; return it to the extension popup on request |
| Active tab ID and ready/version reply | Check content-script availability in the popup |

The last-action record is replaced by the next handled gesture. It has no timer-based expiry. It resets when the document is destroyed, such as through an ordinary reload or closing the page. Browser lifecycle features can retain documents in memory longer than a visible navigation suggests.

Original URLs may contain personal query values or access tokens. Check URLs before sharing screenshots or copies of the status display. Query removal does not remove credentials embedded in a URL, sensitive path segments, or fragments.

## Storage and network boundaries

The reviewed code contains no analytics SDK, telemetry endpoint, fetch/XHR/WebSocket/beacon request, remote executable code, account connection, or API key. It does not query device identifiers, machine names, OS usernames, hardware details, IP-discovery services, or browser fingerprints. It does not use cookie, history, clipboard, native-messaging, or storage APIs.

It does not persist its last-action record in extension storage, local storage, IndexedDB, files, or a remote service. Chrome can independently retain history, session information, cache, and diagnostics.

Opening a target triggers ordinary browser networking. Depending on browser and website behavior, requests can include IP address, browser headers, cookies, and referrer information. Destinations may redirect or add parameters later. Removing query strings does not ensure anonymity or prevent all tracking.

The demo uses `example.com` links and bundled scripts/styles. Opening a link visits that site. Displaying the demo itself loads no remote scripts, images, or fonts. Documentation reference links are visited only if opened by the reader.

## Permissions

Content scripts match HTTP/HTTPS pages, matching frames, and applicable `about:blank` children, subject to Chrome's site-access settings. They can access page DOMs. The manifest requests no additional named API permissions.

The background script accepts clean-link messages from its own extension with a sender tab ID, validates HTTP(S), and removes the query again before opening a tab. No machine-specific path or browser profile is configured in the package.

## Public source review

The review covered the shipped JS, JSON, HTML, CSS, documentation, and portable tests. It found:

- No embedded developer username, home/workspace path, machine identifier, secret, private key, API token, or development-session pin/product URL.
- No bundled third-party library, downloaded photograph, logo, font, or other external asset with an identified asset-attribution requirement.
- Generic demonstration/test URLs and Pinterest domains/selectors used for compatibility.
- No browser profile, cookie export, screenshot, log, conversation export, `.git` history, or scratch directory in the prepared source ZIP.

Test fixtures were made portable and development-session browsing examples were replaced with generic values. Runtime files were unchanged during this documentation update.

This review does not cover files outside the prepared folder, earlier packages, future edits, browser behavior, all possible vulnerabilities, or third-party intellectual-property claims. A project license has not been selected; see [README.md](README.md#publishing-and-license-status).
