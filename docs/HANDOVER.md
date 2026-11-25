# Juntu African Market — Demo Handover
Prepared by Dalal Technologies · private, do not publish

## 1. What the demo is (and is not)
| Works in the demo | What runs it at launch |
|---|---|
| Browsing, categories, filters, sort, search with local names & typos | Shopify collections + Search & Discovery app (synonyms) |
| Cart that survives refresh, drawer + full cart page | Shopify cart |
| Pickup vs shipping, pickup-only blocking | Shopify shipping profiles + Local pickup |
| ZIP shipping preview (**illustrative numbers**) | Live FedEx carrier-calculated rates |
| Checkout with test data, **simulated** payment, test confirmation | Shopify hosted checkout (Shop Pay, Apple Pay, Google Pay, cards) |
| Account “Buy again”, order tracking (test orders on this device) | Shopify customer accounts & order status pages |

- No card data is collected. No payment is made. Prices are provisional. Stock is not connected.
- The `noindex` meta tag keeps the preview out of search engines. Remove it at launch, or password-protect the store.
- A small **Demo preview** button in the green announcement bar explains all of this to the viewer.

## 2. Products (19 live in the demo)
- **8 with Juntu's own photos**: 5 Juntu-label products (palm oil, baobab, thiakry, noflaye, arraw), Sunquick, Peak 380 mL, Herb To Body Sea Moss Bitter.
- **11 West African staples from the Africa Supermarket asset pack**, all with real product photos:
  - Tropiway Cocoyam Fufu Flour, Tropical Sun Fragrant Rice, Afrigrid Ijebu Garri (2 kg), Honey Beans Oloyin (5 lb), Maggi Chicken Cubes, Titus Sardines (125 g), Rosa Margarine (450 g), Indomie Onion Chicken (70 g), NIDO Fortificada (12.6 oz), Bird's Custard, Milo Tin (1.5 kg).
  - Peak 13 oz from that pack was skipped because Juntu has her own Peak photo.
  - The photos come from retailer sites (listed in `assets/products/list/SOURCES.csv`). They are fine for the private demo. Before public launch, confirm Juntu stocks each item and replace each photo with her own shelf photo or a licensed manufacturer image.
- Fresh halal meat, fish, produce and Jamila Kitchen are presented as in-store/pickup information only. No photos or menu were supplied, so nothing was invented. The pickup-only logic is built and tested (set `ship:false` on a product).
- `docs/shopify-products-import.csv` holds all 19 products as **draft**. Upload the images to Shopify Files and swap in their URLs before importing. `docs/catalog-verification-checklist.md` is the sheet to review with Khadija.

## 2b. Photography notes (redesign, Nov 2026)
- The 8 Juntu photos were cut out onto a uniform studio background (#F5F5F3) with a soft shadow.
- On palm oil, Peak and Sunquick, the hands were removed by tracing each product's outline. Packaging, labels, sizes and text are unaltered; only a thin strip at the edges (under 5% of each image) was filled where fingers overlapped. New studio photos of these three are still recommended before launch.
- The hero image and department circles (rice, spices, beans, peppers, hibiscus, cassava) come from the AI-generated ingredient photos in the Africa Supermarket pack. They are mood imagery, not products. Replace them with a real photo shoot of Juntu's ingredients when possible.
- `assets/brand/hero-1600.webp` (desktop) and `hero-m.webp` (mobile) are separate crops; the mobile hero is designed independently.

## 3. Shopify integration path
1. Create the Shopify store (Basic plan is enough to start) and connect the domain.
2. Build an Online Store 2.0 theme from this design. Each homepage block becomes a reusable section: announcement bar, hero, benefits, category tiles, Signature Collection, product rows, African/Caribbean panels, store pickup band, Jamila Kitchen, footer. The owner can then edit banners, text and featured collections in the theme editor without code.
3. Import products from the CSV (after verification). Create collections: Juntu Signature, Rice Grains & Flours, Oils & Seasonings, Pantry Essentials, African Favorites, Caribbean Favorites, Drinks & Beverages, Beauty & Wellness.
4. Install **Search & Discovery** (free) and add synonym groups: thiakry = dégué = chakery · baobab = bouye = pain de singe · peanut powder = noflaye = groundnut · arraw = millet granules = granulé de mil · palm oil = red palm oil · garri = gari · poundo = pounded yam · yam flour = elubo · honey beans = oloyin.
5. Payments: activate Shopify Payments, Shop Pay, Apple Pay and Google Pay. Guest checkout stays on (Settings → Checkout → customer accounts optional).
6. Taxes: turn on Tennessee tax collection in Settings → Taxes. Confirm food-rate treatment with the accountant.
7. Tracking (GA4, Merchant Center, Meta and TikTok pixels): connect them through Shopify’s official apps only after the privacy banner is set up.

## 4. FedEx shipping setup
1. Open or locate a FedEx account for Juntu Market LLC.
2. To get live FedEx rates at checkout, either:
   - (a) use the Shopify plan that includes third-party carrier-calculated shipping, or add it as a feature, then connect FedEx in Settings → Shipping and delivery → Carrier accounts; or
   - (b) use a supported app such as ShipStation or Easyship that returns live FedEx rates.
   Credentials are entered only in Shopify or the app, never in theme code.
3. Enter the real packed **weight** on every product. Set up saved **package sizes** (e.g. small box, medium box, gallon-oil box).
4. Create two shipping profiles:
   - **Ships nationwide**: shelf-stable items.
   - **Pickup only**: meat, fish, frozen, produce and Jamila Kitchen. Give this profile no shipping zones, so checkout cannot ship these items.
5. Optional: add a handling fee for packaging if Khadija decides on one.
6. Place a test order to 3 or more ZIP codes (local TN, East Coast, West Coast) and compare the rates against FedEx.com.

## 5. Local pickup setup
- Settings → Shipping and delivery → Local pickup → enable **3826 E Shelby Dr**.
- Pickup instructions: “Wait for your ‘ready for pickup’ message. Bring your order number.”
- Set “usually ready in…” **only** after Khadija confirms a real preparation time.
- Customers are only told an order is ready when Khadija taps **Mark as ready for pickup**. Shopify then sends the notification.

## 6. Owner’s daily routine (Shopify admin or mobile app)
1. **Morning**: open *Orders*, filter by *Unfulfilled*.
2. **Pickup orders**: gather the items, then tap **Mark as ready for pickup** (the customer gets a text/email). When the customer collects, tap **Mark as picked up**.
3. **Shipping orders**: pack, then tap **Create shipping label**. Choose the FedEx service the customer paid for and print the label. Tracking is emailed to the customer automatically.
4. **Stock and prices**: open *Products*, choose the item and edit the price or quantity. To add a product, tap **Add product** and upload a photo.
5. **Refunds**: open the order, tap **Refund** and choose the items.
6. **Promotions**: go to *Discounts* and create a code or automatic discount (only when approved).
7. **Weekly**: check *Analytics* for top products and sales. Check *Customers* for repeat buyers.
WhatsApp stays available for questions, but customers no longer need it to buy.

## 7. Production launch checklist
- [ ] Shopify subscription and plan chosen (carrier-calculated shipping available)
- [ ] Domain connected
- [ ] Shopify Payments, Shop Pay, Apple Pay and Google Pay activated
- [ ] FedEx account connected and carrier rates tested
- [ ] Confirmed prices for every product
- [ ] Actual packed weights and package dimensions
- [ ] Inventory counts verified
- [ ] Stock confirmed for the 11 staples from the Africa Supermarket pack; their retailer photos replaced with owner or licensed photos
- [ ] Shipping policy approved
- [ ] Returns & refunds, privacy and terms policies approved (pages currently say they will be published)
- [ ] Business hours confirmed (the site currently says “please call for current hours”; the window poster says “Open 7 days a week”, which needs confirming)
- [ ] Verified social media profiles (none linked yet)
- [ ] Jamila Kitchen menu, prices and photos (if online ordering is wanted)
- [ ] Ownership of the similarly named Houston business clarified (excluded for now)
- [ ] Remove `noindex` and the demo-preview button; submit the sitemap in Search Console
- [ ] End-to-end test orders: 1 pickup, 1 in-state shipment, 1 out-of-state shipment, 1 refund

## 8. Testing done on the demo (all passed)
Memphis pickup order with several items · out-of-state order with shipping estimate and express option · pickup-only item blocked when shipping is selected (switch-to-pickup and remove options) · search by alternative names and misspellings (degue, bouye, noflaye, millet granules, thiakri, baobob, sunqick, gari, maggie, foufou, oloyin) · quantity changes · cart persists after refresh · guest checkout with validation errors · remove and undo · 360 px phone with no sideways scrolling on every page · every internal link and route · no console errors.
