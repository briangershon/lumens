import type {
  FiltersState,
  FixedObject,
  ObjectGroup,
  Observability,
  RawFixedObject,
  StarSizeBucket,
} from './types.js';

const STAR_BUCKETS = [
  { id: 'bright', maxMag: 1.5 },
  { id: 'mid', maxMag: 2.7 },
  { id: 'faint', maxMag: 3.6 },
  { id: 'very-faint', maxMag: Infinity },
] as const satisfies ReadonlyArray<{ id: StarSizeBucket; maxMag: number }>;

export function getStarSizeBucket(mag: number | null): StarSizeBucket | null {
  if (mag == null) return null;
  for (const bucket of STAR_BUCKETS) {
    if (mag <= bucket.maxMag) return bucket.id;
  }
  return 'very-faint';
}

export function getObjectGroup(
  object: Pick<RawFixedObject, 'kind' | 'subtype'>
): ObjectGroup {
  if (object.kind === 'black-hole') return 'black-hole';
  if (object.subtype === 'pulsar') return 'pulsar';
  if (object.subtype === 'magnetar') return 'magnetar';
  if (object.kind === 'neutron-star') return 'neutron-star';
  return 'star';
}

export function getObservability(
  object: Pick<RawFixedObject, 'kind' | 'subtype'>
): Observability {
  return getObjectGroup(object) === 'star' ? 'observable' : 'unobservable';
}

export function defaultFilters(): FiltersState {
  return {
    showObservable: true,
    showUnobservable: true,
    showBrightStars: true,
    showMidStars: true,
    showFaintStars: true,
    showVeryFaintStars: true,
    showBlackHoles: true,
    showNeutronStars: true,
    showPulsars: true,
    showMagnetars: true,
    showConstellations: true,
    showLabels: true,
  };
}

export function isObservabilityEnabled(
  observability: Observability,
  filters: FiltersState
): boolean {
  return observability === 'observable'
    ? filters.showObservable
    : filters.showUnobservable;
}

export function isObjectVisibleInFilters(
  object: FixedObject,
  filters: FiltersState
): boolean {
  if (!isObservabilityEnabled(object.observability, filters)) return false;

  switch (object.group) {
    case 'star':
      if (object.sizeBucket === 'bright') return filters.showBrightStars;
      if (object.sizeBucket === 'mid') return filters.showMidStars;
      if (object.sizeBucket === 'faint') return filters.showFaintStars;
      return filters.showVeryFaintStars;
    case 'black-hole':
      return filters.showBlackHoles;
    case 'neutron-star':
      return filters.showNeutronStars;
    case 'pulsar':
      return filters.showPulsars;
    case 'magnetar':
      return filters.showMagnetars;
    default:
      return true;
  }
}

export function shouldDrawConstellations(filters: FiltersState): boolean {
  return filters.showConstellations && filters.showObservable;
}

export function shouldAutoLabelObject(object: FixedObject): boolean {
  return object.group === 'star' && object.sizeBucket === 'bright';
}

export function objectTypeLabel(object: FixedObject): string {
  if (object.group === 'black-hole') return 'Black hole';
  if (object.group === 'pulsar') return 'Pulsar';
  if (object.group === 'magnetar') return 'Magnetar';
  if (object.group === 'neutron-star') return 'Neutron star';
  return 'Star';
}
