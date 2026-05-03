# @briangershon/lumens-starmap-banner

Interactive web component for rendering an animated starmap banner with visible stars, constellations, and exotic unseen objects such as black holes. Mouse over astronomical objects to inspect more details, and use it on either light or dark host surfaces.

## Install

```bash
npm install @briangershon/lumens-starmap-banner
```

## Quick use

```ts
import '@briangershon/lumens-starmap-banner';
```

```html
<lumens-starmap-banner></lumens-starmap-banner>
```

For the full installation and usage guide, including browser-bundle usage and event-listening examples, use the canonical docs page:
[https://briangershon.github.io/lumens/getting-started.html](https://briangershon.github.io/lumens/getting-started.html)

## Attributes and properties

| Attribute     | Property     | Type      | Default                    | Notes                                                                  |
| ------------- | ------------ | --------- | -------------------------- | ---------------------------------------------------------------------- |
| `speed`       | `speed`      | `number`  | `1800`                     | Positive number controlling simulated time progression.                |
| `label-limit` | `labelLimit` | `number`  | `14`                       | Positive integer limit for visible labels.                             |
| `start-time`  | `startTime`  | `string`  | `2026-01-15T05:00:00.000Z` | ISO timestamp used as the initial sky state.                           |
| `dark-mode`   | `darkMode`   | `boolean` | `false`                    | Enables the higher-contrast foreground palette for dark host surfaces. |

## Events

### `starmap-object-selected`

Dispatched when the hovered astronomical object changes over the canvas so the host can surface richer object details.

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

- Canonical install and usage guide: [https://briangershon.github.io/lumens/getting-started.html](https://briangershon.github.io/lumens/getting-started.html)
- Repository and workspace docs: https://github.com/briangershon/lumens#readme

## License

MIT. See the repository license file for details.
