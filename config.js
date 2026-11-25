/* Juntu African Market — site configuration (Dalal Technologies).
   Everything the owner must confirm before launch lives here, so production changes are
   one-line edits rather than a rebuild. See docs/OWNER-APPROVALS.md. */
window.JUNTU_CONFIG = {
  /* DEMO MODE — set to false for production. Hides the "Demo preview" pill and the
     "Demo price" notes, and relabels test checkout copy. Also remove the robots noindex
     tag in index.html and the X-Robots-Tag header in netlify.toml at launch. */
  demo: true,

  /* Final domain, e.g. "https://www.juntumarket.com". Used for canonical + social metadata.
     Leave empty until the domain is connected; all asset paths are relative. */
  siteUrl: "",

  store: {
    name: "Juntu African Market",
    legal: "Juntu Market LLC",
    street: "3826 E Shelby Dr",
    city: "Memphis",
    region: "Tennessee",
    regionCode: "TN",
    zip: "38118",                 // OWNER TO CONFIRM
    phone: "+19016912274",        // from the storefront sign — do not change
    phoneDisplay: "+1 (901) 691-2274",
    phone2: "+19016660379",       // secondary line (contact page only) — OWNER TO CONFIRM
    phone2Display: "+1 (901) 666-0379",
    /* WhatsApp is shown ONLY when the owner confirms the number supports it. */
    whatsappConfirmed: false,
    whatsapp: "https://wa.me/19016912274",
    /* Store hours are NOT published until the owner confirms them. Example: "Mon–Sun 10am–8pm". */
    hours: ""
  },

  shipping: {
    /* Turn U.S. shipping on/off for the whole store. Pickup is always available. */
    enabled: true,
    /* Product categories that can never ship (perishables). Products also carry ship:true/false. */
    pickupOnlyNote: "Fresh meat, fish, frozen foods and produce are store pickup only.",
    /* Illustrative estimator for the demo only — replaced by live carrier rates at launch.
       No carrier, delivery date or free-shipping offer is promised anywhere on the site. */
    illustrativeRates: true
  }
};
