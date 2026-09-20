# Privacy Policy for ZERO BOOKMARK

Last updated: September 20, 2026

ZERO BOOKMARK is a Chrome extension that saves the current web page as a real 0-byte file whose filename contains the information needed to return to that page.

## Data handling

ZERO BOOKMARK does not collect, transmit, sell, or share personal data or browsing history.

When the user opens the extension, ZERO BOOKMARK uses Chrome's `activeTab` permission to read the URL and title of the currently active tab. This access occurs only after the user invokes the extension.

The URL and title are processed locally in the browser. They are not sent to any server, analytics service, advertising service, or other third party.

When a ZERO BOOKMARK file is created:

- the file content is empty (0 bytes);
- the page URL is encoded into the filename;
- the visible title is also part of the filename;
- no server-side mapping or account is created.

When a ZERO BOOKMARK file is opened, the URL is decoded locally from the filename and Chrome opens that URL in a new tab.

## Storage

ZERO BOOKMARK does not use remote storage, cookies, extension storage, or a server-side database to store user URLs or browsing activity.

Files created by the extension are stored wherever the user chooses to save them on their own device.

## Permissions

ZERO BOOKMARK requests only the `activeTab` permission. It is used solely to obtain the URL and title of the current page when the user invokes the extension.

## Third parties

ZERO BOOKMARK contains no advertising, analytics, tracking, or external JavaScript libraries, and does not transmit user data to third parties.

## Contact

For questions about this privacy policy, use the project's GitHub repository:

https://github.com/Masato-Nasu/ZERO-BOOKMARK
