import { equatorialToHorizontal, localSiderealTime } from './astronomy.js';
import { createBannerRenderer } from './banner-renderer.js';
import { CONSTELLATIONS } from './data/constellations.js';
import { FIXED_OBJECTS, OBJECT_PHYSICALS_BY_ID } from './data/stars.js';
import { objectTypeLabel } from './filters.js';
import type { AltAz, FixedObject, PhysicalMetadata } from './types.js';

const ELEMENT_TAG_NAME = 'lumens-starmap-banner';
const SELECTION_EVENT_NAME = 'starmap-object-selected';

const DEFAULT_CONFIG = {
  speedX: 1800,
  observer: {
    lat: 47.5,
    lon: -122,
  },
  sceneStartTime: '2026-01-15T05:00:00Z',
  scene: {
    cropCenterX: 0.52,
    cropCenterY: 1.18,
    radiusScale: 1.2,
    tiltDeg: -14,
    glowDriftPx: 14,
    labelLimit: 14,
    darkMode: false,
  },
} as const;

type BannerConfig = {
  speedX?: number;
  sceneStartTime?: string | Date | null;
  observer?: {
    lat?: number;
    lon?: number;
  };
  scene?: {
    darkMode?: boolean;
    labelLimit?: number;
  };
};

export type StarmapSelectionDetail = {
  selected: boolean;
  id: string | null;
  name: string | null;
  type: string | null;
  observability: string | null;
  constellation: string | null;
  magnitude: number | null;
  distanceLy: number | null;
  altitude: number | null;
  azimuth: number | null;
};

function parsePositiveNumber(
  value: string | number | null | undefined,
  fallback: number
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveInteger(
  value: string | number | null | undefined,
  fallback: number
): number {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseStartTime(
  value: string | Date | null | undefined,
  fallback: Date
): Date {
  if (!value) {
    return fallback;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function normalizeConfig(userConfig: BannerConfig = {}) {
  const sceneDefaults = DEFAULT_CONFIG.scene;
  const sceneConfig = userConfig.scene ?? {};

  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    speedX: parsePositiveNumber(userConfig.speedX, DEFAULT_CONFIG.speedX),
    sceneStartTime: parseStartTime(
      userConfig.sceneStartTime,
      new Date(DEFAULT_CONFIG.sceneStartTime)
    ),
    observer: {
      ...DEFAULT_CONFIG.observer,
      ...userConfig.observer,
    },
    scene: {
      ...sceneDefaults,
      ...sceneConfig,
      darkMode: Boolean(sceneConfig.darkMode),
      labelLimit: parsePositiveInteger(
        sceneConfig.labelLimit,
        sceneDefaults.labelLimit
      ),
    },
  };
}

const STAR_TO_CON = (() => {
  const constellationByStarId = new Map<string, string>();

  for (const constellation of CONSTELLATIONS) {
    for (const [leftId, rightId] of constellation.lines) {
      if (!constellationByStarId.has(leftId)) {
        constellationByStarId.set(leftId, constellation.name);
      }
      if (!constellationByStarId.has(rightId)) {
        constellationByStarId.set(rightId, constellation.name);
      }
    }
  }

  return constellationByStarId;
})();

type BannerController = {
  destroy: () => void;
};

function createBannerController(
  host: LumensStarmapBanner,
  root: HTMLElement,
  userConfig: BannerConfig = {}
): BannerController {
  const config = normalizeConfig(userConfig);
  const canvas =
    root.querySelector('canvas') ?? document.createElement('canvas');
  canvas.className = 'starmap-banner-canvas';

  if (!canvas.parentElement) {
    root.appendChild(canvas);
  }

  const renderer: any = createBannerRenderer(canvas, config.scene);
  const altAzById = new Map<string, AltAz>();
  const state = {
    simTime: new Date(config.sceneStartTime),
    lastFrameMs: performance.now(),
    rafId: 0,
    selectedId: null as string | null,
  };

  function projectAll(): void {
    const lst = localSiderealTime(state.simTime, config.observer.lon);
    altAzById.clear();

    for (const object of FIXED_OBJECTS as FixedObject[]) {
      const { altitude, azimuth } = equatorialToHorizontal(
        object.ra,
        object.dec,
        config.observer.lat,
        lst
      );
      altAzById.set(object.id, { altitude, azimuth });
    }
  }

  function dispatchHoverDetail(selectedId: string | null): void {
    const object = selectedId
      ? (FIXED_OBJECTS as FixedObject[]).find(
          (entry) => entry.id === selectedId
        )
      : null;
    const altAz = selectedId ? (altAzById.get(selectedId) ?? null) : null;
    const physical = selectedId
      ? (OBJECT_PHYSICALS_BY_ID as Record<string, PhysicalMetadata>)[selectedId]
      : null;

    host.dispatchEvent(
      new CustomEvent<StarmapSelectionDetail>(SELECTION_EVENT_NAME, {
        bubbles: true,
        composed: true,
        detail: {
          selected: Boolean(object && altAz),
          id: object?.id ?? null,
          name: object?.name ?? null,
          type: object ? objectTypeLabel(object) : null,
          observability: object?.observability ?? null,
          constellation: object
            ? (STAR_TO_CON.get(object.id) ?? object.con ?? null)
            : null,
          magnitude: object?.mag ?? null,
          distanceLy: physical?.distanceLy ?? null,
          altitude: altAz?.altitude ?? null,
          azimuth: altAz?.azimuth ?? null,
        },
      })
    );
  }

  function updateSelection(nextSelectedId: string | null): void {
    if (state.selectedId === nextSelectedId) {
      return;
    }

    state.selectedId = nextSelectedId;
    dispatchHoverDetail(nextSelectedId);
  }

  function tick(nowMs: number): void {
    const dtMs = nowMs - state.lastFrameMs;
    state.lastFrameMs = nowMs;
    state.simTime = new Date(state.simTime.getTime() + dtMs * config.speedX);
    projectAll();
    renderer.draw(altAzById, state.simTime.getTime() / 1000, state.selectedId);
    state.rafId = requestAnimationFrame(tick);
  }

  function onMouseMove(event: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const hit = renderer.hitTest(mouseX, mouseY, altAzById, 14);

    if (hit?.id) {
      updateSelection(hit.id);
    }
  }

  let resizeObserver: ResizeObserver | null = null;
  const onResize = () => renderer.resize();
  renderer.resize();
  canvas.addEventListener('mousemove', onMouseMove);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(root);
  } else {
    globalThis.addEventListener('resize', onResize);
  }

  state.rafId = requestAnimationFrame((time) => {
    state.lastFrameMs = time;
    tick(time);
  });

  return {
    destroy() {
      cancelAnimationFrame(state.rafId);
      canvas.removeEventListener('mousemove', onMouseMove);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        globalThis.removeEventListener('resize', onResize);
      }
    },
  };
}

const COMPONENT_CSS = `
  :host {
    display: block;
    width: 100%;
  }

  .banner-root {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  .starmap-banner-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export class LumensStarmapBanner extends HTMLElement {
  static observedAttributes = [
    'speed',
    'label-limit',
    'start-time',
    'dark-mode',
  ];

  #controller: BannerController | null = null;
  #rootEl: HTMLDivElement | null = null;

  connectedCallback(): void {
    if (!this.#rootEl) {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = `
        <style>${COMPONENT_CSS}</style>
        <div class="banner-root"></div>
      `;
      this.#rootEl = shadowRoot.querySelector('.banner-root');
    }

    this.restart();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue !== newValue && this.isConnected) {
      this.restart();
    }
  }

  get speed(): number {
    return parsePositiveNumber(
      this.getAttribute('speed'),
      DEFAULT_CONFIG.speedX
    );
  }

  set speed(value: number) {
    this.setAttribute(
      'speed',
      String(parsePositiveNumber(value, DEFAULT_CONFIG.speedX))
    );
  }

  get labelLimit(): number {
    return parsePositiveInteger(
      this.getAttribute('label-limit'),
      DEFAULT_CONFIG.scene.labelLimit
    );
  }

  set labelLimit(value: number) {
    this.setAttribute(
      'label-limit',
      String(parsePositiveInteger(value, DEFAULT_CONFIG.scene.labelLimit))
    );
  }

  get startTime(): string {
    return this.getAttribute('start-time') ?? DEFAULT_CONFIG.sceneStartTime;
  }

  set startTime(value: string) {
    const parsed = parseStartTime(
      value,
      new Date(DEFAULT_CONFIG.sceneStartTime)
    );
    this.setAttribute('start-time', parsed.toISOString());
  }

  get darkMode(): boolean {
    return this.hasAttribute('dark-mode');
  }

  set darkMode(value: boolean) {
    if (value) {
      this.setAttribute('dark-mode', '');
    } else {
      this.removeAttribute('dark-mode');
    }
  }

  getConfig(): BannerConfig {
    return {
      speedX: this.speed,
      sceneStartTime: parseStartTime(
        this.getAttribute('start-time'),
        new Date(DEFAULT_CONFIG.sceneStartTime)
      ),
      scene: {
        darkMode: this.darkMode,
        labelLimit: this.labelLimit,
      },
    };
  }

  restart(): void {
    if (!this.#rootEl) {
      return;
    }

    this.teardown();
    this.#controller = createBannerController(
      this,
      this.#rootEl,
      this.getConfig()
    );
  }

  teardown(): void {
    if (this.#controller) {
      this.#controller.destroy();
      this.#controller = null;
    }
  }
}

export function defineLumensStarmapBanner(): void {
  if (!customElements.get(ELEMENT_TAG_NAME)) {
    customElements.define(ELEMENT_TAG_NAME, LumensStarmapBanner);
  }
}

defineLumensStarmapBanner();
