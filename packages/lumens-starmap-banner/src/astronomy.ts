// @ts-nocheck
// Pure-function astronomy utilities. No dependencies.
// Reductions follow Meeus, "Astronomical Algorithms" (2nd ed.).

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function julianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// Greenwich Mean Sidereal Time, in hours [0, 24).
export function gmst(date) {
  const jd = julianDate(date);
  const t = (jd - 2451545.0) / 36525;
  let degrees =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  degrees = ((degrees % 360) + 360) % 360;
  return degrees / 15;
}

// Local Sidereal Time, in hours [0, 24). East longitude positive.
export function localSiderealTime(date, longitudeDeg) {
  const lst = gmst(date) + longitudeDeg / 15;
  return ((lst % 24) + 24) % 24;
}

// (RA hours, Dec degrees) + observer latitude + LST (hours)
//   → { altitude, azimuth } in degrees.
// Azimuth: 0=N, 90=E, 180=S, 270=W.
export function equatorialToHorizontal(ra, dec, latDeg, lstHours) {
  const haDeg = (((lstHours - ra) * 15 + 540) % 360) - 180; // [-180, 180)
  const ha = haDeg * DEG;
  const d = dec * DEG;
  const lat = latDeg * DEG;

  const sinAlt =
    Math.sin(d) * Math.sin(lat) + Math.cos(d) * Math.cos(lat) * Math.cos(ha);
  const altitude = Math.asin(sinAlt) * RAD;

  const cosAz =
    (Math.sin(d) - sinAlt * Math.sin(lat)) /
    (Math.cos(Math.asin(sinAlt)) * Math.cos(lat));
  // Clamp for floating-point safety before acos.
  const clamped = Math.max(-1, Math.min(1, cosAz));
  let azimuth = Math.acos(clamped) * RAD;
  if (Math.sin(ha) > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}
