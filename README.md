# noQueryParamThx - remove trackers when clicking links

A Chrome Manifest V3 extension that opens a link in a background tab with its entire query string removed. Hold **Ctrl** and press the **middle mouse button** on a supported link.

Extension version: **0.2.1**. Documentation updated: **2026-11-19**.

This update adds documentation and portable tests; runtime behavior is unchanged. The popup, notifications, and demo remain in Turkish. This README is the primary English guide. The updated [Turkish guide](docs/archive/KURULUM.tr-0.2.1.md) is archived as a snapshot.

## Main Usage
1.Removing query parameters targeting to relate your website visits
2.Navigating ecommerce platforms and doing market research without hurting sellers(listing ad click fee costs)

## Behavior

| Input | Result |
| --- | --- |
| Ctrl + middle click | Remove the entire query and open a background tab |
| Middle click without Ctrl | Leave normal behavior in place |
| Ctrl + left click | Leave normal behavior in place |


```text
https://example.com/article?utm_source=demo&ref=test#section
→ https://example.com/article#section
```

Only HTTP/HTTPS targets are accepted. The path and `#fragment` are preserved. This removes **every query parameter**, including those required by some websites; it does not selectively identify trackers.

## Installation

1. Extract the ZIP to a permanent folder, or download the source folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.
4. Reload web pages that were already open.

## Limitations

- Removing video IDs, search queries, access signatures, or nested redirect targets can break links.
- Chrome-internal pages, the Chrome Web Store, browser toolbars/bookmarks, the built-in PDF viewer, directly opened local HTML files, and desktop applications are outside this version's scope.
- Except for the Pinterest adapter, controls without an `a[href]` or `area[href]` target are not resolved. Closed shadow roots and unusual event handling can prevent detection.
- Chrome site-access restrictions affect injection. Incognito access must be enabled separately if desired.
- This is not an anonymity tool or a guarantee against tracking.

## Privacy and permissions

There is no analytics, telemetry, remote backend, remote code, account, or third-party runtime dependency. The extension does not query device identifiers or save click records in browser storage.

Content scripts run on applicable HTTP/HTTPS pages and frames. Chrome can describe this as access to read/change site data. No additional named API permissions are requested. The code reads link targets; the Pinterest adapter also reads the page's exposed outbound-link markup.

The last original URL, cleaned URL, and result remain in the originating document's memory for the popup. Original URLs can contain sensitive values. They are not written to extension storage or sent to a remote service by this code. Opening a target still invokes normal browser networking and can create history entries. See [PRIVACY.md](PRIVACY.md) for retention boundaries and the source-package review.

## Architecture and files

```text
Link / supported Pinterest Visit button
  → content.js: capture Ctrl + middle-button press
  → cleaner.js: accept HTTP(S), remove URL.search
  → background.js: validate message, create background tab
  → popup.js: show current-page status and last target
```

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 and content-script matches |
| `cleaner.js` | URL parsing and full query removal |
| `pinterest.js` | Pinterest Visit-button target resolution |
| `content.js` | Gesture capture, cancellation, feedback, in-memory status |
| `background.js` | Message validation and tab creation |
| `popup.html`, `popup.css`, `popup.js` | Status popup and demo launcher |
| `deneme.html`, `deneme.css` | Bundled demo |
| `tests/` | Portable Node.js checks with generic fixtures |
| `docs/archive/` | Archived Turkish guide |

## Validation

With Node.js installed, run from this folder:

```shell
node tests/test-extension.cjs
node tests/test-popup.cjs
```

No test dependency installation is needed. Checks cover query removal, fragments, gesture deduplication, Ctrl release, changed DOM targets, normal-click exclusions, Pinterest resolution, background validation, failure handling, popup states, and manifest file references.

The Pinterest resolver was also checked against a live pin's DOM during development, confirming extraction of the expected clean target. This was not a complete automated check of an installed extension's live click/navigation. Manual Chrome verification is still needed after installation. Portable tests use generic URLs rather than development-session browsing examples.
