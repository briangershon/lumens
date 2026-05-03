// @ts-nocheck

// Hand-curated stick figures for ~15 well-known constellations visible from
// the northern mid-latitudes. Each `lines` entry is a pair of star ids that
// must exist in data/stars.js; the renderer draws a segment only when both
// endpoints are above the horizon.

export const CONSTELLATIONS = [
  {
    name: 'Ursa Major',
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    name: 'Ursa Minor',
    lines: [
      ['polaris', 'yildun'],
      ['yildun', 'epsilon_umi'],
      ['epsilon_umi', 'zeta_umi'],
      ['zeta_umi', 'eta_umi'],
      ['eta_umi', 'pherkad'],
      ['pherkad', 'kochab'],
      ['kochab', 'zeta_umi'],
    ],
  },
  {
    name: 'Cassiopeia',
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'gamma_cas'],
      ['gamma_cas', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    name: 'Cepheus',
    lines: [
      ['alderamin', 'alfirk'],
      ['alfirk', 'gamma_cep'],
      ['gamma_cep', 'iota_cep'],
      ['iota_cep', 'alderamin'],
      ['iota_cep', 'zeta_cep'],
      ['zeta_cep', 'alderamin'],
    ],
  },
  {
    name: 'Draco',
    lines: [
      ['rastaban', 'eltanin'],
      ['eltanin', 'xi_dra'],
      ['xi_dra', 'rastaban'],
      ['xi_dra', 'aldhibah'],
      ['aldhibah', 'altais'],
      ['altais', 'edasich'],
      ['edasich', 'thuban'],
      ['thuban', 'giausar'],
    ],
  },
  {
    name: 'Orion',
    lines: [
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['betelgeuse', 'meissa'],
      ['bellatrix', 'meissa'],
    ],
  },
  {
    name: 'Taurus',
    lines: [
      ['aldebaran', 'epsilon_tau'],
      ['aldebaran', 'gamma_tau'],
      ['epsilon_tau', 'delta_tau'],
      ['delta_tau', 'gamma_tau'],
      ['gamma_tau', 'theta_tau'],
      ['epsilon_tau', 'elnath'],
      ['aldebaran', 'zeta_tau'],
    ],
  },
  {
    name: 'Gemini',
    lines: [
      ['castor', 'mebsuta'],
      ['mebsuta', 'propus'],
      ['propus', 'tejat'],
      ['tejat', 'alhena'],
      ['pollux', 'wasat'],
      ['wasat', 'alhena'],
      ['pollux', 'kappa_gem'],
    ],
  },
  {
    name: 'Auriga',
    lines: [
      ['capella', 'menkalinan'],
      ['menkalinan', 'mahasim'],
      ['mahasim', 'elnath'],
      ['elnath', 'hassaleh'],
      ['hassaleh', 'capella'],
      ['capella', 'saclateni'],
      ['saclateni', 'haedus'],
    ],
  },
  {
    name: 'Leo',
    lines: [
      ['regulus', 'eta_leo'],
      ['eta_leo', 'algieba'],
      ['algieba', 'adhafera'],
      ['adhafera', 'mu_leo'],
      ['mu_leo', 'algenubi'],
      ['regulus', 'chertan'],
      ['algieba', 'zosma'],
      ['zosma', 'chertan'],
      ['zosma', 'denebola'],
      ['chertan', 'denebola'],
    ],
  },
  {
    name: 'Boötes',
    lines: [
      ['arcturus', 'izar'],
      ['izar', 'delta_boo'],
      ['delta_boo', 'nekkar'],
      ['nekkar', 'seginus'],
      ['seginus', 'rho_boo'],
      ['rho_boo', 'arcturus'],
      ['muphrid', 'arcturus'],
    ],
  },
  {
    name: 'Cygnus',
    lines: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['sadr', 'delta_cyg'],
      ['sadr', 'gienah_cyg'],
    ],
  },
  {
    name: 'Lyra',
    lines: [
      ['vega', 'epsilon_lyr'],
      ['vega', 'zeta_lyr'],
      ['epsilon_lyr', 'delta2_lyr'],
      ['delta2_lyr', 'sulafat'],
      ['sulafat', 'sheliak'],
      ['sheliak', 'zeta_lyr'],
    ],
  },
  {
    name: 'Aquila',
    lines: [
      ['tarazed', 'altair'],
      ['altair', 'alshain'],
      ['altair', 'delta_aql'],
      ['delta_aql', 'zeta_aql'],
      ['delta_aql', 'theta_aql'],
      ['delta_aql', 'lambda_aql'],
    ],
  },
  {
    name: 'Scorpius',
    lines: [
      ['acrab', 'dschubba'],
      ['dschubba', 'pi_sco'],
      ['pi_sco', 'alniyat'],
      ['alniyat', 'antares'],
      ['antares', 'tau_sco'],
      ['tau_sco', 'larawag'],
      ['larawag', 'iota_sco'],
      ['iota_sco', 'shaula'],
      ['shaula', 'sargas'],
    ],
  },
];
