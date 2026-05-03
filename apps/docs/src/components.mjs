export const components = [
  {
    packageName: '@briangershon/lumens-starmap-banner',
    tagName: 'lumens-starmap-banner',
    bundleName: 'lumens-starmap-banner.bundle.js',
    displayName: 'Lumens Starmap Banner',
    summary:
      'An open-source starmap banner with visible stars, constellations, exotic unseen objects like black holes, hover details, and light or dark host support.',
    preview: {
      kind: 'starmap-banner',
      eventName: 'starmap-object-selected',
      variants: [
        {
          title: 'Light host background',
          description:
            'The host frame supplies the pale surface while the component keeps its foreground tuned for bright layouts.',
          hostTheme: 'light',
          attributes: {
            speed: '900',
            'label-limit': '14',
            'start-time': '2026-01-15T05:00:00Z',
          },
        },
        {
          title: 'Dark host background',
          description:
            'The host frame owns the dark treatment while the component switches to its higher-contrast foreground palette.',
          hostTheme: 'dark',
          attributes: {
            'dark-mode': '',
            speed: '900',
            'label-limit': '14',
            'start-time': '2026-01-15T05:00:00Z',
          },
        },
      ],
    },
    gettingStarted: {
      overview:
        'An interactive astronomical banner with visible stars, constellations, and exotic unseen objects like black holes. Hover astronomical objects to inspect richer detail, and use `dark-mode` when the host surface needs the higher-contrast palette.',
      installBody:
        'Install the package in any app that can load ESM in the browser.',
      bundleBody:
        'If you are not installing from npm, load the standalone browser bundle directly from the package output.',
      esmBody:
        'Import the package once, then place the custom element anywhere in your layout.',
      eventBody:
        'The component emits `starmap-object-selected` whenever the hovered astronomical object changes.',
      esmImport: "import '@briangershon/lumens-starmap-banner';",
      markupExample: `<lumens-starmap-banner
  dark-mode
  speed="900"
  label-limit="14"
  start-time="2026-01-15T05:00:00Z"
></lumens-starmap-banner>`,
      eventExample: `document
  .querySelector('lumens-starmap-banner')
  ?.addEventListener('starmap-object-selected', (event) => {
    if (!event.detail.selected) return;
    console.log(event.detail.name, event.detail.type);
  });`,
      expectations: [
        {
          title: 'Host-owned layout',
          description:
            'The banner is designed to layer into a host header rather than act as a full page or framework-owned scene.',
        },
        {
          title: 'Light and dark surfaces',
          description:
            'Use the default palette for light hosts, or add `dark-mode` when the banner sits on a darker editorial surface.',
        },
      ],
    },
  },
];
