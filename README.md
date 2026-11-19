# Temiz Bağlantı · Clean Link

A Chrome Manifest V3 extension that opens a link in a background tab with its entire query string removed. Hold **Ctrl** and press the **middle mouse button** on a supported link.

Extension version: **0.2.1**. Documentation updated: **2026-11-19**.

This update adds documentation and portable tests; runtime behavior is unchanged. The popup, notifications, and demo remain in Turkish. This README is the primary English guide. The updated [Turkish guide](docs/archive/KURULUM.tr-0.2.1.md) is archived as a snapshot.

## Behavior

| Input | Result |
| --- | --- |
| Ctrl + middle click | Remove the entire query and open a background tab |
| Middle click without Ctrl | Leave normal behavior in place |
| Ctrl + left click | Leave normal behavior in place |
| Ctrl + middle click with Shift, Alt, or Meta also held | Do not handle the gesture |

```text
https://example.com/article?utm_source=demo&ref=test#section
→ https://example.com/article#section
```

Only HTTP/HTTPS targets are accepted. The path and `#fragment` are preserved. This removes **every query parameter**, including those required by some websites; it does not selectively identify trackers.

## Installation and updates

1. Extract the ZIP to a permanent folder, or download the source folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.
4. Reload web pages that were already open.

Keep the selected folder in place. No build step, dependency installation, account, server, or API key is required. This source snapshot is for local loading; it is not a Chrome Web Store listing.

Click the extension in Chrome's Extensions menu to check the active page. **Deneme sayfasını aç** opens the bundled demo. Pinning the toolbar icon is optional.

To update, replace files in the same folder, click the extension's reload button on `chrome://extensions`, and reload open pages. Verify version **0.2.1**. If moving to another folder, remove the old copy and load the new one. Avoid running two copies. Use **Remove** on the extensions page to uninstall.

## Pinterest support

On pin detail pages under `pinterest.com` and its subdomains, **Visit site / Ziyaret et** can be a JavaScript button without an `href`. The adapter recognizes the visit control and reads the outbound URL exposed by the page's `clickthrough-link` anchor. It cleans that URL and opens it directly.

One unambiguous outbound URL is required. If none is available, or several different targets exist, the adapter leaves the gesture to the page. It recognizes observed Pinterest test attributes and English/Turkish visit labels. Other Pinterest country domains and unrecognized button variants are outside this adapter's scope. Pinterest can change its markup, requiring an update.

The URL is captured and opened on button press, before most page handlers can replace it or add click-time parameters. Releasing Ctrl before releasing the mouse does not open a duplicate tab. The extension does not wait to see whether the gesture becomes a drag.

## Status popup and troubleshooting

Open the popup while the original page is active, after attempting a click.

| Popup text | Meaning / next step |
| --- | --- |
| **Bu sayfada hazır ✓** | The content script responds on this page. |
| **Bu sayfada etkin değil** | Reload the page; if needed, grant access for that site in Chrome's extension settings. |
| **Bu sayfada henüz bağlantı yakalanmadı…** | No supported gesture has been captured in this top-frame document. A custom button may not expose a URL. |
| **Temiz adres yeni sekmeye gönderildi.** | Chrome accepted the request to open the displayed clean URL. |
| **Tıklama algılandı, ancak sekme açılamadı.** | The gesture was captured, but tab creation failed. Reload and retry. |

**Bağlantının hedefi** shows the original target; **Açılması istenen temiz adres** shows the URL submitted to Chrome. A brief notification confirms successful handling.

If the final address has parameters while the popup shows a clean URL, the destination may have added them through a redirect or JavaScript. The extension does not continuously rewrite the new tab or intercept every redirect. The popup checks the top frame; an iframe gesture can work without appearing in its last-action display.

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

## Publishing and license status

Publish this folder or the prepared source ZIP's contents. Development scratch directories, browser profiles, screenshots, logs, conversation exports, and earlier ZIPs are not part of this source package. No developer username, machine path, device identifier, credential, or personal browsing example was found in the reviewed package. This review is not legal clearance or an independent security certification.

**No project license has been selected; no `LICENSE` file is included.** Making source public does not itself grant the usual open-source reuse rights. The rights holder should choose a license before describing the project as open source. See [GitHub's licensing guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository); [MIT](https://opensource.org/license/mit) is one permissive option. No license was applied on the publisher's behalf.

Public source hosting and Chrome Web Store distribution are separate steps. This package has not been submitted to a store. Product names identify compatibility only; no affiliation or endorsement is claimed.
