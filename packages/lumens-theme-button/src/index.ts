const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      color-scheme: light dark;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.625rem;
      border: 0;
      border-radius: 999px;
      min-inline-size: 13rem;
      padding: 0.75rem 0.9rem 0.75rem 1rem;
      font: 600 0.95rem/1.1 system-ui, sans-serif;
      cursor: pointer;
      transition:
        transform 140ms ease,
        box-shadow 140ms ease,
        background-color 140ms ease,
        color 140ms ease;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:focus-visible {
      outline: 3px solid rgba(14, 165, 233, 0.4);
      outline-offset: 3px;
    }

    :host([mode='light']) button {
      background: linear-gradient(135deg, #fef3c7, #fb7185);
      color: #111827;
    }

    :host([mode='dark']) button {
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
      color: #eff6ff;
    }

    .icon {
      inline-size: 1.15rem;
      block-size: 1.15rem;
      flex: none;
    }

    .state {
      margin-inline-start: auto;
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.22);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  </style>
  <button type="button">
    <span class="icon" aria-hidden="true"></span>
    <span class="label"><slot>Theme toggle</slot></span>
    <span class="state"></span>
  </button>
`;

const MODE_VALUES = new Set(['light', 'dark']);

type Mode = 'light' | 'dark';

const icons: Record<Mode, string> = {
  light:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"></circle><path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12H2.75M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23L5.46 5.46"></path></svg>',
  dark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.6 14.1A8.82 8.82 0 0 1 9.9 3.4a.55.55 0 0 0-.83-.6 10.26 10.26 0 1 0 12.13 12.13.55.55 0 0 0-.6-.83Z"></path></svg>',
};

export type ThemeMode = Mode;

export class LumensThemeButton extends HTMLElement {
  static observedAttributes = ['mode'];

  #button: HTMLButtonElement;
  #icon: HTMLSpanElement;
  #state: HTMLSpanElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(template.content.cloneNode(true));

    this.#button = shadow.querySelector('button') as HTMLButtonElement;
    this.#icon = shadow.querySelector('.icon') as HTMLSpanElement;
    this.#state = shadow.querySelector('.state') as HTMLSpanElement;

    this.#button.addEventListener('click', () => {
      this.mode = this.mode === 'light' ? 'dark' : 'light';

      this.dispatchEvent(
        new CustomEvent('clicked', {
          bubbles: true,
          composed: true,
          detail: { mode: this.mode },
        })
      );
    });
  }

  connectedCallback(): void {
    if (!this.hasAttribute('mode')) {
      this.mode = 'light';
    }

    this.#render();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name !== 'mode') {
      return;
    }

    if (newValue && !MODE_VALUES.has(newValue)) {
      this.mode = 'light';
      return;
    }

    this.#render();
  }

  get mode(): Mode {
    return this.getAttribute('mode') === 'dark' ? 'dark' : 'light';
  }

  set mode(value: Mode) {
    this.setAttribute('mode', MODE_VALUES.has(value) ? value : 'light');
  }

  #render(): void {
    const mode = this.mode;
    this.#icon.innerHTML = icons[mode];
    this.#state.textContent = mode;
    this.#button.setAttribute(
      'aria-label',
      `Toggle theme mode, current mode ${mode}`
    );
  }
}

if (!customElements.get('lumens-theme-button')) {
  customElements.define('lumens-theme-button', LumensThemeButton);
}
