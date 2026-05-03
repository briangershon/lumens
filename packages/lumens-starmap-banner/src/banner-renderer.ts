import type {
  AltAz,
  BannerSceneOptions,
  Constellation,
  FixedObject,
  LabelBox,
  Point,
} from './types.js';
import { FIXED_OBJECTS } from './data/stars.js';
import { CONSTELLATIONS } from './data/constellations.js';

const DEG = Math.PI / 180;

const DEFAULT_SCENE = {
  cropCenterX: 0.52,
  cropCenterY: 1.18,
  radiusScale: 1.2,
  tiltDeg: -14,
  glowDriftPx: 14,
  labelLimit: 14,
  darkMode: false,
} as const satisfies BannerSceneOptions;

const PALETTES = {
  light: {
    constellation: 'rgba(55, 93, 149, 0.16)',
    label: (alpha: number) => `rgba(37, 57, 89, ${alpha})`,
    blackHoleRing: 'rgba(68, 117, 172, 0.62)',
    blackHoleAccretion: 'rgba(196, 149, 92, 0.56)',
    blackHoleCore: 'rgba(20, 27, 41, 0.96)',
    compactFill: 'rgba(44, 78, 129, 0.9)',
    compactRing: 'rgba(167, 198, 240, 0.6)',
    pulsarAccent: 'rgba(93, 173, 214, 0.44)',
    magnetarAccent: 'rgba(137, 108, 197, 0.48)',
    heroShimmer: (alpha: number) => `rgba(94, 122, 170, ${alpha})`,
    selectionRing: 'rgba(221, 168, 79, 0.92)',
    selectionGlow: 'rgba(241, 208, 136, 0.24)',
    starMixAmount: 0.1,
    starGlowBaseBright: 0.15,
    starGlowBaseNormal: 0.09,
    compactGlowBase: 0.14,
  },
  dark: {
    constellation: 'rgba(148, 188, 245, 0.22)',
    label: (alpha: number) => `rgba(232, 241, 255, ${alpha})`,
    blackHoleRing: 'rgba(144, 203, 255, 0.82)',
    blackHoleAccretion: 'rgba(255, 197, 129, 0.74)',
    blackHoleCore: 'rgba(4, 8, 18, 0.98)',
    compactFill: 'rgba(191, 223, 255, 0.96)',
    compactRing: 'rgba(132, 186, 255, 0.82)',
    pulsarAccent: 'rgba(109, 217, 255, 0.62)',
    magnetarAccent: 'rgba(190, 160, 255, 0.62)',
    heroShimmer: (alpha: number) => `rgba(194, 221, 255, ${alpha})`,
    selectionRing: 'rgba(255, 221, 142, 0.96)',
    selectionGlow: 'rgba(255, 234, 178, 0.30)',
    starMixAmount: 0.36,
    starGlowBaseBright: 0.28,
    starGlowBaseNormal: 0.15,
    compactGlowBase: 0.22,
  },
};

function colorForBV(bv: number | null): string {
  if (bv == null) return '#3f78c7';
  if (bv < -0.1) return '#6a9dff';
  if (bv < 0.3) return '#4b74c3';
  if (bv < 0.7) return '#8c7c55';
  if (bv < 1.0) return '#b98f52';
  if (bv < 1.5) return '#cb7d47';
  return '#bf6840';
}

function objectRadius(obj: FixedObject): number {
  if (obj.group === 'black-hole') return 4.8;
  if (
    obj.group === 'neutron-star' ||
    obj.group === 'pulsar' ||
    obj.group === 'magnetar'
  ) {
    return 3.8;
  }
  return Math.max(1.2, 4.8 - (obj.mag ?? 4.8) * 0.72);
}

function priorityForObject(obj: FixedObject): number {
  if (obj.group === 'black-hole') return 9;
  if (obj.group === 'pulsar' || obj.group === 'magnetar') return 8;
  if (obj.group === 'neutron-star') return 7;
  if ((obj.mag ?? 99) <= 0.6) return 10;
  if ((obj.mag ?? 99) <= 1.5) return 8;
  if ((obj.mag ?? 99) <= 2.4) return 6;
  return 0;
}

function labelFontForPriority(priority: number): string {
  if (priority >= 9) return "600 15px Georgia, 'Times New Roman', serif";
  if (priority >= 7) return "600 13px Georgia, 'Times New Roman', serif";
  return "500 12px Georgia, 'Times New Roman', serif";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mixColors(
  hex: string,
  amount: number
): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const int = Number.parseInt(normalized, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);
  return { r: mix(r), g: mix(g), b: mix(b) };
}

function colorString(
  { r, g, b }: { r: number; g: number; b: number },
  alpha = 1
): string {
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

const COMPACT_OBJECT_TINT = { r: 119, g: 171, b: 236 };

function hashPhase(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 33 + id.charCodeAt(i)) % 10000;
  }
  return (hash / 10000) * Math.PI * 2;
}

export function createBannerRenderer(
  canvas: HTMLCanvasElement,
  scene: Partial<BannerSceneOptions> = {}
): {
  resize: () => void;
  draw: (
    altAzById: Map<string, AltAz>,
    timeSeconds: number,
    selectedId?: string | null
  ) => number;
  hitTest: (
    mouseX: number,
    mouseY: number,
    altAzById: Map<string, AltAz>,
    threshold?: number
  ) => FixedObject | null;
} {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2D canvas context is required for lumens-starmap-banner');
  }
  const ctx: CanvasRenderingContext2D = context;
  const options = { ...DEFAULT_SCENE, ...scene };
  const palette = options.darkMode ? PALETTES.dark : PALETTES.light;
  let width = 1200;
  let height = 600;
  let dpr = 1;
  let radius = 720;
  let centerX = width * options.cropCenterX;
  let centerY = height * options.cropCenterY;
  let lastLabelBoxes: LabelBox[] = [];

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = Math.max(320, Math.floor(rect.width || 1200));
    height = Math.max(160, Math.floor(rect.height || Math.round(width / 2)));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = Math.max(width, height) * options.radiusScale;
    centerX = width * options.cropCenterX;
    centerY = height * options.cropCenterY;
  }

  function project(altitude: number, azimuth: number): Point {
    const radialDistance = ((90 - altitude) / 90) * radius;
    const azimuthRadians = azimuth * DEG;
    const x = centerX - radialDistance * Math.sin(azimuthRadians);
    const y = centerY + radialDistance * Math.cos(azimuthRadians);
    const tilt = options.tiltDeg * DEG;
    const dx = x - centerX;
    const dy = y - centerY;
    return {
      x: centerX + dx * Math.cos(tilt) - dy * Math.sin(tilt),
      y: centerY + dx * Math.sin(tilt) + dy * Math.cos(tilt),
    };
  }

  function drawBackground(): void {
    ctx.clearRect(0, 0, width, height);
  }

  function constellationVisiblePoints(
    altAzById: Map<string, AltAz>,
    line: Constellation['lines'][number]
  ): { pa: Point; pb: Point } | null {
    const [aId, bId] = line;
    const a = altAzById.get(aId);
    const b = altAzById.get(bId);
    if (!a || !b || a.altitude < 0 || b.altitude < 0) return null;
    const pa = project(a.altitude, a.azimuth);
    const pb = project(b.altitude, b.azimuth);
    return { pa, pb };
  }

  function drawConstellationFragments(altAzById: Map<string, AltAz>): void {
    ctx.save();
    ctx.strokeStyle = palette.constellation;
    ctx.lineWidth = 1;
    for (const constellation of CONSTELLATIONS) {
      for (const line of constellation.lines) {
        const points = constellationVisiblePoints(altAzById, line);
        if (!points) continue;
        const { pa, pb } = points;
        if (
          (pa.x < -40 && pb.x < -40) ||
          (pa.x > width + 40 && pb.x > width + 40) ||
          (pa.y < -40 && pb.y < -40) ||
          (pa.y > height + 40 && pb.y > height + 40)
        ) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawStarGlow(
    x: number,
    y: number,
    radiusPx: number,
    tint: { r: number; g: number; b: number },
    alpha: number
  ): void {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radiusPx * 6);
    glow.addColorStop(0, colorString(tint, alpha));
    glow.addColorStop(0.3, colorString(tint, alpha * 0.25));
    glow.addColorStop(1, colorString(tint, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radiusPx * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawObjectMarker(
    obj: FixedObject,
    projected: Point,
    timeSeconds: number
  ): void {
    const baseRadius = objectRadius(obj);
    const phase = hashPhase(obj.id);
    const x = projected.x;
    const y = projected.y;

    if (obj.group === 'black-hole') {
      ctx.save();
      ctx.strokeStyle = palette.blackHoleRing;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius + 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = palette.blackHoleAccretion;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        baseRadius * 2.4,
        baseRadius * 1.1,
        -0.35,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.fillStyle = palette.blackHoleCore;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius * 0.82, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (
      obj.group === 'neutron-star' ||
      obj.group === 'pulsar' ||
      obj.group === 'magnetar'
    ) {
      const compactGlowAlpha =
        palette.compactGlowBase + Math.sin(timeSeconds * 0.4 + phase) * 0.02;
      drawStarGlow(x, y, baseRadius, COMPACT_OBJECT_TINT, compactGlowAlpha);
      ctx.fillStyle = palette.compactFill;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.compactRing;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius + 1.8, 0, Math.PI * 2);
      ctx.stroke();
      if (obj.group === 'pulsar') {
        ctx.strokeStyle = palette.pulsarAccent;
        ctx.beginPath();
        ctx.moveTo(x - baseRadius * 3, y);
        ctx.lineTo(x + baseRadius * 3, y);
        ctx.moveTo(x, y - baseRadius * 3);
        ctx.lineTo(x, y + baseRadius * 3);
        ctx.stroke();
      }
      if (obj.group === 'magnetar') {
        ctx.strokeStyle = palette.magnetarAccent;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    const tint = mixColors(colorForBV(obj.bv), palette.starMixAmount);
    const glowBaseAlpha =
      obj.mag != null && obj.mag < 1.4
        ? palette.starGlowBaseBright
        : palette.starGlowBaseNormal;
    const glowAlpha =
      glowBaseAlpha + Math.sin(timeSeconds * 0.35 + phase) * 0.012;
    drawStarGlow(x, y, baseRadius, tint, glowAlpha);
    ctx.fillStyle = colorString(tint);
    ctx.beginPath();
    ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    if (obj.mag != null && obj.mag < 0.8) {
      const shimmer = 0.65 + Math.sin(timeSeconds * 1.2 + phase) * 0.2;
      ctx.strokeStyle = palette.heroShimmer(shimmer * 0.32);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - baseRadius * 3, y);
      ctx.lineTo(x + baseRadius * 3, y);
      ctx.moveTo(x, y - baseRadius * 3);
      ctx.lineTo(x, y + baseRadius * 3);
      ctx.stroke();
    }
  }

  function visibleLabelAlpha(x: number, y: number): number {
    const margin = 42;
    const left = clamp((x + margin) / margin, 0, 1);
    const right = clamp((width + margin - x) / margin, 0, 1);
    const top = clamp((y + margin) / margin, 0, 1);
    const bottom = clamp((height + margin - y) / margin, 0, 1);
    return Math.min(left, right, top, bottom);
  }

  function drawLabels(
    candidates: Array<{ obj: FixedObject; point: Point; priority: number }>,
    timeSeconds: number
  ): void {
    lastLabelBoxes = [];
    let placed = 0;
    for (const entry of candidates) {
      if (placed >= options.labelLimit) break;
      const { obj, point, priority } = entry;
      const edgeAlpha = visibleLabelAlpha(point.x, point.y);
      if (edgeAlpha <= 0.08) continue;
      const pulse =
        0.92 + Math.sin(timeSeconds * 0.5 + hashPhase(obj.id)) * 0.08;
      const alpha = edgeAlpha * pulse;
      ctx.font = labelFontForPriority(priority);
      const text = obj.name;
      const widthPx = ctx.measureText(text).width;
      const x = point.x + 10;
      const y = point.y - 2;
      const box = {
        left: x - 4,
        top: y - 11,
        right: x + widthPx + 4,
        bottom: y + 7,
      };
      const overlaps = lastLabelBoxes.some(
        (placedBox) =>
          box.left < placedBox.right &&
          box.right > placedBox.left &&
          box.top < placedBox.bottom &&
          box.bottom > placedBox.top
      );
      if (overlaps) continue;
      lastLabelBoxes.push(box);
      placed += 1;

      ctx.fillStyle = palette.label(alpha);
      ctx.fillText(text, x, y);
    }
  }

  function drawSelection(
    selectedId: string | null,
    altAzById: Map<string, AltAz>,
    timeSeconds: number
  ): void {
    if (!selectedId) return;
    const selected = FIXED_OBJECTS.find((obj) => obj.id === selectedId);
    const aa = altAzById.get(selectedId);
    if (!selected || !aa || aa.altitude < 0) return;
    const point = project(aa.altitude, aa.azimuth);
    if (
      point.x < -80 ||
      point.x > width + 80 ||
      point.y < -80 ||
      point.y > height + 80
    )
      return;

    const baseRadius = objectRadius(selected);
    const pulse =
      0.7 + Math.sin(timeSeconds * 2.1 + hashPhase(selected.id)) * 0.14;

    ctx.save();
    ctx.strokeStyle = palette.selectionRing;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(point.x, point.y, baseRadius + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = palette.selectionGlow;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, baseRadius + 10 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function hitTest(
    mouseX: number,
    mouseY: number,
    altAzById: Map<string, AltAz>,
    threshold = 14
  ): FixedObject | null {
    let best: FixedObject | null = null;
    let bestDist = threshold;
    for (const obj of FIXED_OBJECTS) {
      const aa = altAzById.get(obj.id);
      if (!aa || aa.altitude < 0) continue;
      const point = project(aa.altitude, aa.azimuth);
      if (
        point.x < -80 ||
        point.x > width + 80 ||
        point.y < -80 ||
        point.y > height + 80
      )
        continue;
      const distance = Math.hypot(point.x - mouseX, point.y - mouseY);
      if (distance < bestDist) {
        best = obj;
        bestDist = distance;
      }
    }
    return best;
  }

  function draw(
    altAzById: Map<string, AltAz>,
    timeSeconds: number,
    selectedId: string | null = null
  ): number {
    drawBackground();
    drawConstellationFragments(altAzById);

    const labelCandidates: Array<{
      obj: FixedObject;
      point: Point;
      priority: number;
    }> = [];
    let visible = 0;
    for (const obj of FIXED_OBJECTS) {
      const aa = altAzById.get(obj.id);
      if (!aa || aa.altitude < 0) continue;
      const point = project(aa.altitude, aa.azimuth);
      if (
        point.x < -80 ||
        point.x > width + 80 ||
        point.y < -80 ||
        point.y > height + 80
      )
        continue;
      visible += 1;
      drawObjectMarker(obj, point, timeSeconds);
      const priority = priorityForObject(obj);
      if (priority > 0) labelCandidates.push({ obj, point, priority });
    }

    labelCandidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return (a.obj.mag ?? 99) - (b.obj.mag ?? 99);
    });
    drawLabels(labelCandidates, timeSeconds);
    drawSelection(selectedId, altAzById, timeSeconds);
    return visible;
  }

  return { resize, draw, hitTest };
}
