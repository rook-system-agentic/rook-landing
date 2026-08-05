# ROO-985 design QA

- Reference: `https://www.rook.com.br/planos/`
- Prototype: `http://localhost:3010/planos/`
- Desktop viewport: 1280 x 720
- Responsive viewport: 390 px wide

## Visual checks

- Preserved the existing landing-page design language: dark palette, typography, spacing, borders, buttons, navigation, and footer.
- Replaced the static threshold diagram with a revenue selector in the same visual hierarchy.
- The selected plan is the only base-plan card displayed, avoiding contradictory prices.
- Knight selection displays R$ 479,90 per establishment/month.
- Rook selection displays R$ 779,90 per establishment/month.
- Chess stays visible as a monthly organizational add-on at R$ 279,90, without publishing progressive-discount rules.
- Desktop and mobile navigation remain usable and the selector exposes an accessible label.

## Interaction checks

- Selecting the second revenue range changes the live status and visible card from Knight to Rook.
- Selecting the first revenue range restores Knight.
- Both specialist CTAs open the commercial-lead dialog.
- The dialog exposes required name, e-mail, phone, and CNPJ fields, optional company, consent copy, privacy link, cancel, close, and submit controls.
- The public page contains no progressive Chess discount percentages or discount table.

## Technical checks

- Landing unit tests: passed.
- Landing TypeScript check: passed.
- Landing production build: passed.
- App web unit tests, TypeScript check, and production build: passed.
- ADM unit tests, TypeScript check, and production build: passed.

final result: passed
