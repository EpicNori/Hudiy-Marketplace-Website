# Website submission test report

Date: 2026-08-11
Target: local Website preview on `http://127.0.0.1:4175/`

## Scope

This test covers the Website catalogue filters, the separated login/account/submission windows, Firebase e-mail/password authentication, GitHub manifest validation, and the Firestore pending-submission write.

## Test fixture

- Public repository: [Hudiy-Marketplace-E2E-Test-Plugin](https://github.com/EpicNori/Hudiy-Marketplace-E2E-Test-Plugin)
- Ref: `main`
- Manifest path: `manifest.json`
- Commit: `bbfead197440f7d5eab23dea89b52d9d149d0a14`
- Fixture contents: declarative HTML/CSS, `manifest.json`, README, and `style.md`; no shell, Python, native, systemd, or package-manager content.
- An isolated Firebase e-mail/password test account was used. Its password is not stored in this repository or report.

## Results

| Test | Result | Evidence |
|---|---|---|
| Marketplace filter parity | PASS | Website exposes `Alle`, `Apps`, `Widgets`, `Overlays`, and `Dashboards` in the same order as the Marketplace. |
| Filter state changes | PASS | Each filter becomes `filter active` and updates the result count. |
| Login window separation | PASS | `Anmelden` opens only `#login-dialog`; repository fields are not visible there. |
| Account window separation | PASS | After authentication, the header opens only `#account-dialog` with account identity, submission, and sign-out actions. |
| Submission window separation | PASS | `Einreichen` opens only `#upload-dialog`; unauthenticated users see a link back to login and a disabled submit button. |
| E-mail/password sign-up | PASS | The isolated test account was created and the header changed to `Konto`. |
| Public GitHub manifest fetch | PASS | The Website fetched the fixture manifest from `raw.githubusercontent.com`. |
| Firestore submission | PASS | The Website displayed `GitHub-Repository geprüft und zur Moderation eingereicht.` |
| Secret handling | PASS | No password or service-account key was written to the repository or report. |

## Conclusion

The Website now keeps catalogue browsing, authentication, account management, and contribution submission as separate UI surfaces. The real public GitHub-to-Firestore submission path passed with the declarative test fixture.

