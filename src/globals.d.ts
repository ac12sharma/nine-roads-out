// Globals the browser scripts use that the DOM types don't know about. Type-checking only.
interface Window {
  /** Google's consent message API, present only when AdSense is switched on. */
  googlefc?: { callbackQueue?: (() => void)[], showRevocationMessage?: () => void };
  /** The scene renderer from src/assets/scenes.js, used by scripts/render-images.mjs. */
  NRO_SCENES?: { renderStill: (canvas: HTMLCanvasElement, scene: string, w: number, h: number, dpr: number, t: number) => void };
}
interface HTMLElement {
  /** Timer for a status message that clears itself (say() and tell() in app.js). */
  __t?: ReturnType<typeof setTimeout>;
}
interface Navigator {
  /** Global Privacy Control (https://globalprivacycontrol.org/): true when the visitor opts out of tracking. */
  readonly globalPrivacyControl?: boolean;
}
