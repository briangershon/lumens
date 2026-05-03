export type ObjectKind = 'star' | 'black-hole' | 'neutron-star';

export type ObjectSubtype = 'pulsar' | 'magnetar';

export type ObjectGroup =
  | 'star'
  | 'black-hole'
  | 'neutron-star'
  | 'pulsar'
  | 'magnetar';

export type Observability = 'observable' | 'unobservable';

export type StarSizeBucket = 'bright' | 'mid' | 'faint' | 'very-faint';

export type RawFixedObject = {
  id: string;
  name: string;
  ra: number;
  dec: number;
  mag: number | null;
  bv: number | null;
  kind?: ObjectKind;
  subtype?: ObjectSubtype;
  con?: string;
};

export type FixedObject = RawFixedObject & {
  kind: ObjectKind;
  group: ObjectGroup;
  observability: Observability;
  sizeBucket: StarSizeBucket | null;
};

export type FiltersState = {
  showObservable: boolean;
  showUnobservable: boolean;
  showBrightStars: boolean;
  showMidStars: boolean;
  showFaintStars: boolean;
  showVeryFaintStars: boolean;
  showBlackHoles: boolean;
  showNeutronStars: boolean;
  showPulsars: boolean;
  showMagnetars: boolean;
  showConstellations: boolean;
  showLabels: boolean;
};

export type PhysicalMetadata = {
  distanceLy: number | null;
  radiusRsun: number | null;
  massMsun: number | null;
  ageMyr: number | null;
};

export type AltAz = {
  altitude: number;
  azimuth: number;
};

export type Point = {
  x: number;
  y: number;
};

export type LabelBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Constellation = {
  name: string;
  lines: Array<[string, string]>;
};

export type BannerSceneOptions = {
  cropCenterX: number;
  cropCenterY: number;
  radiusScale: number;
  tiltDeg: number;
  glowDriftPx: number;
  labelLimit: number;
  darkMode: boolean;
};
