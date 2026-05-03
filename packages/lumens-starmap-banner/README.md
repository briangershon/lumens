# @briangershon/lumens-starmap-banner

Decorative web component for rendering an animated starmap banner on light or dark host surfaces.

## Install

```bash
npm install @briangershon/lumens-starmap-banner
```

## ESM usage

```ts
import '@briangershon/lumens-starmap-banner';

document
  .querySelector('lumens-starmap-banner')
  ?.addEventListener('starmap-object-selected', (event) => {
    if (!event.detail.selected) return;
    console.log(event.detail.name, event.detail.type);
  });
```

```html
<lumens-starmap-banner
  dark-mode
  speed="1800"
  label-limit="14"
  start-time="2026-01-15T05:00:00Z"
></lumens-starmap-banner>
```

## Browser bundle

```html
<script
  type="module"
  src="./node_modules/@briangershon/lumens-starmap-banner/dist/lumens-starmap-banner.bundle.js"
></script>

<lumens-starmap-banner
  speed="1800"
  label-limit="14"
  start-time="2026-01-15T05:00:00Z"
></lumens-starmap-banner>
```

The package also exposes the browser bundle through the `./bundle` export for tooling that resolves package subpath exports.

## Attributes and properties

| Attribute     | Property     | Type      | Default                    | Notes                                                                  |
| ------------- | ------------ | --------- | -------------------------- | ---------------------------------------------------------------------- |
| `speed`       | `speed`      | `number`  | `1800`                     | Positive number controlling simulated time progression.                |
| `label-limit` | `labelLimit` | `number`  | `14`                       | Positive integer limit for visible labels.                             |
| `start-time`  | `startTime`  | `string`  | `2026-01-15T05:00:00.000Z` | ISO timestamp used as the initial sky state.                           |
| `dark-mode`   | `darkMode`   | `boolean` | `false`                    | Enables the higher-contrast foreground palette for dark host surfaces. |

## Events

### `starmap-object-selected`

Dispatched when the hover target changes over the canvas.

```ts
type StarmapSelectionDetail = {
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
```

When `detail.selected` is `false`, the rest of the fields are `null`.

## Demo and docs

- Repository and workspace docs: https://github.com/briangershon/lumens#readme
- Shared Lumens docs app: `apps/docs` in the repository

## License

MIT. See the repository license file for details.
