// Patrones de la tarjeta DG Gel ABO/Rh según la "Gráfica grupos sanguíneos" de LICON.
// true = positivo (glóbulos atrapados arriba del gel) · false = negativo (botón en el fondo)
// Columnas: A · B · AB · D · D* · Ctl · N/A1 · N/B
window.DGGEL = (function () {
  const COLUMNAS = [
    { id: 'A',   label: 'A',    color: '#1DA1D8', texto: '#fff' },
    { id: 'B',   label: 'B',    color: '#F7D117', texto: '#3b3300' },
    { id: 'AB',  label: 'AB',   color: '#E4342B', texto: '#fff' },
    { id: 'D',   label: 'D',    color: '#8B949C', texto: '#fff' },
    { id: 'D2',  label: 'D*',   color: '#8B949C', texto: '#fff' },
    { id: 'CTL', label: 'Ctl.', color: '#ECEFF1', texto: '#333' },
    { id: 'NA1', label: 'N/A1', color: '#ECEFF1', texto: '#333' },
    { id: 'NB',  label: 'N/B',  color: '#ECEFF1', texto: '#333' },
  ];

  //                A      B      AB     D      D*     Ctl    N/A1   N/B
  const PATRONES = {
    'O+':  [false, false, false, true,  true,  false, true,  true ],
    'O-':  [false, false, false, false, false, false, true,  true ],
    'A+':  [true,  false, true,  true,  true,  false, false, true ],
    'A-':  [true,  false, true,  false, false, false, false, true ],
    'B+':  [false, true,  true,  true,  true,  false, true,  false],
    'B-':  [false, true,  true,  false, false, false, true,  false],
    'AB+': [true,  true,  true,  true,  true,  false, false, false],
    'AB-': [true,  true,  true,  false, false, false, false, false],
  };

  const NOMBRES = {
    'O+': 'O positivo', 'O-': 'O negativo',
    'A+': 'A positivo', 'A-': 'A negativo',
    'B+': 'B positivo', 'B-': 'B negativo',
    'AB+': 'AB positivo', 'AB-': 'AB negativo',
  };

  const GRUPOS = Object.keys(PATRONES);

  // Geometría de la tarjeta en unidades de 1920 × 1080 (pantalla 16:9).
  // La máscara física se genera con estos mismos números (assets/mascara_85.svg).
  const GEO = {
    W: 1920, H: 1080,
    tubos: {
      n: 8, x0: 240, paso: 205.7,
      embudoTop: 60, embudoAncho: 124, embudoBase: 250,
      colAncho: 46, colTop: 250, colFondo: 640,
      gelTop: 390,
    },
    banda: { x: 180, y: 680, w: 1560, h: 70 },
    franja: { x: 180, y: 790, w: 1560, h: 220, r: 18 },
  };

  return { COLUMNAS, PATRONES, NOMBRES, GRUPOS, GEO };
})();
