// Ads & in-app purchases.
//  - Android (Capacitor): AdMob rewarded ads (@capacitor-community/admob) + Google Play Billing (cordova-plugin-purchase).
//  - Browser: TEST MODE — fake rewarded ad and test purchases that never charge anything.
// Before release: replace the AdMob IDs below with your own (AdMob console) and create the product IDs
// from data.js SHOP in Google Play Console (same IDs, prices as listed).
import { SHOP } from './data.js';

// Google's official public TEST ids (safe to use while developing; ads show "Test Ad").
export const ADMOB = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
  testing: true,
};

const CONSUMABLE = new Set(['rl_flux_s', 'rl_flux_l', 'rl_coin_s', 'rl_coin_l', 'rl_month', 'rl_pass', 'rl_ore_s', 'rl_ore_l', 'rl_ore_m', 'rl_ore_xl', 'rl_flux_xl', 'rl_bundle_3k', 'rl_bundle_5k', 'rl_bundle_10k']);
// Store page and the public browser version (set WEB_URL after uploading the web build).
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.revlegion.game';
export const WEB_URL = 'https://tamaphon098-dot.github.io/revolution-legion/';
const isLocalTest = () => ['localhost', '127.0.0.1'].includes(location.hostname) || /[?&]test=1/.test(location.search);
const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

export class Monetize {
  constructor(onGrant, ui) {
    this.onGrant = onGrant; // (productId) => void
    this.ui = ui;           // for test-mode dialogs
    this.native = isNative();
    // public browser build: no real payments and no ads — bonuses are free, purchases point to the app
    this.web = !this.native && !isLocalTest();
    this.prices = {};
    this.ready = false;
  }

  async init() {
    if (!this.native) { this.ready = true; return; }
    try {
      const AdMob = window.Capacitor.Plugins.AdMob;
      if (AdMob) await AdMob.initialize({ initializeForTesting: ADMOB.testing });
    } catch (e) { console.warn('AdMob init failed', e); }
    await new Promise((r) => (window.CdvPurchase ? r() : document.addEventListener('deviceready', r, { once: true })));
    try {
      const { store, ProductType, Platform } = window.CdvPurchase;
      store.register(SHOP.map((p) => ({ id: p.id, platform: Platform.GOOGLE_PLAY, type: CONSUMABLE.has(p.id) ? ProductType.CONSUMABLE : ProductType.NON_CONSUMABLE })));
      store.when()
        .approved((t) => t.verify())
        .verified((r) => r.finish())
        .finished((t) => t.products.forEach((p) => this.onGrant(p.id)))
        .productUpdated((p) => { if (p.pricing) this.prices[p.id] = p.pricing.price; });
      await store.initialize([Platform.GOOGLE_PLAY]);
      this.store = store; this.Platform = Platform;
      this.ready = true;
    } catch (e) { console.warn('billing init failed', e); }
  }

  price(p) { return this.prices[p.id] || p.price; }

  // Rewarded ad. Resolves true only when the reward was earned.
  async showRewarded() {
    if (this.web) return true;
    if (!this.native) return this.ui.fakeAd();
    try {
      const AdMob = window.Capacitor.Plugins.AdMob;
      await AdMob.prepareRewardVideoAd({ adId: ADMOB.rewardedId, isTesting: ADMOB.testing });
      const reward = await AdMob.showRewardVideoAd();
      return !!reward;
    } catch (e) { console.warn('ad failed', e); return false; }
  }

  async buy(productId) {
    if (this.web) { this.ui.appOnly(); return false; }
    if (!this.native) {
      const ok = await this.ui.testPurchase(SHOP.find((p) => p.id === productId));
      if (ok) this.onGrant(productId);
      return ok;
    }
    if (!this.store) return false;
    const product = this.store.get(productId, this.Platform.GOOGLE_PLAY);
    const offer = product && product.getOffer();
    if (!offer) return false;
    const err = await offer.order();
    return !err;
  }

  async restore() { if (this.store) await this.store.restorePurchases(); }
}
