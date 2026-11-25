# Juntu African Market — Owner Approvals & Production Integrations
Prepared by Dalal Technologies · review with Khadija before launch

Everything below is either unconfirmed business information or a service that still has to be connected. Nothing on this list is presented on the site as verified. Settings marked **config** live in `config.js`.

## A. Business information to confirm
| Item | Current state on the site | Where to change |
|---|---|---|
| Store address | 3826 E Shelby Dr, Memphis, Tennessee | config `store.street` |
| ZIP code 38118 | Used in directions link and structured data only | config `store.zip`, `index.html` JSON-LD |
| Main phone +1 (901) 691-2274 | Shown everywhere (matches the storefront sign) | config: do not change |
| Second phone +1 (901) 666-0379 | Contact page only | config `store.phone2` |
| WhatsApp on 901-691-2274 | **Hidden** until confirmed | config `store.whatsappConfirmed: true` |
| Store hours | **Not shown**; the site says "please call". The window poster says "Open 7 days a week" | config `store.hours` |
| Product list | 19 products. 8 photographed at Juntu; 11 West African staples are **not yet confirmed** as stocked | `data.js` |
| Prices | Provisional preview prices | `data.js` |
| Package sizes and weights | Shown only where printed on the pack | `data.js` |
| Juntu Signature line | 5 products: palm oil, baobab, thiakry, noflaye, arraw. Are there others? | `data.js` |
| Halal meat, fish, fresh vegetables, Jamila Kitchen | Described as in-store only, from the window posters | `app.js` |
| Store photos | The two enhanced photos supplied (exterior and interior). Owner to confirm she is happy for them to be public | `assets/store/` |

## B. Shipping decisions (all configurable)
- [ ] Ship nationally at all? (config `shipping.enabled`; set it to false for pickup only)
- [ ] Which products may ship (every product has `ship: true/false` in `data.js`; all 19 are currently marked as shippable shelf-stable goods)
- [ ] Carrier and account (no carrier is named on the public site)
- [ ] Shipping fees, handling fee, delivery areas and timelines (none are published; the demo estimator is clearly marked as illustrative)
- [ ] Packed weights and box sizes for every product
- [ ] Confirm that fresh meat, fish, frozen food, produce and prepared meals stay pickup only (this is what the site says now)
- [ ] Pickup preparation time (none is promised; customers are told to wait for a "ready" message)

## C. Policies (shown as "Draft for owner review")
- [ ] Returns & Refunds
- [ ] Privacy Policy
- [ ] Terms & Conditions
- [ ] Shipping & Pickup page wording (factual, but fees and timelines must be added once decided)
- [ ] FAQ answers

## D. Production integrations still to connect
| Function | Demo behaviour | Production |
|---|---|---|
| Payments | Test checkout. No card is collected and nothing is charged. The confirmation says "Test order — no payment was taken" | Shopify checkout (Shopify Payments, Shop Pay, Apple Pay, Google Pay) |
| Inventory | Not connected | Shopify inventory |
| Shipping rates | Illustrative ZIP-based estimate | Live carrier-calculated rates |
| Taxes | "Calculated at checkout" | Shopify Tax, Tennessee settings confirmed with an accountant |
| Orders and notifications | Saved on the visitor's device | Shopify orders, pickup-ready emails and texts |
| Customer accounts | Sign-in explains it opens at launch | Shopify customer accounts |
| Order tracking | Finds test orders on this device | Shopify order status pages |
| Search synonyms | Built into `data.js` tags | Shopify Search & Discovery synonym groups (see HANDOVER §3) |
| Analytics and pixels | None installed | Add only after a privacy banner is set up |

## E. Launch switches
1. `config.js` → `demo: false` (hides the Demo preview pill and the preview-price notes).
2. `index.html` → delete `<meta name="robots" content="noindex, nofollow">`.
3. `netlify.toml` → delete the `X-Robots-Tag` header block.
4. `config.js` → set `siteUrl` to the final domain, then update `og:image` and the JSON-LD image URLs in `index.html` to absolute URLs on that domain.
5. Netlify → Domain management → add the custom domain. No code change is needed because all paths are relative.
6. Submit the sitemap and site in Google Search Console, and create or verify the Google Business Profile.
