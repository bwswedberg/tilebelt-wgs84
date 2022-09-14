import * as tileService from './';

describe('normalizeLng', () => {
  test.each([
    [-180, 0],
    [0, 0.5],
    [180, 1],
    [90, 0.75]
  ])('should normalize when %s', (lng, expectedValue) => {
    const output = tileService.normalizeLng(lng);
    expect(output).toBe(expectedValue);
  });
});

describe('normalizeLat', () => {
  test.each([
    [90, 0],
    [0, 0.5],
    [-90, 1],
    [45, 0.25]
  ])('should normalize when %s', (lat, expectedValue) => {
    const output = tileService.normalizeLat(lat);
    expect(output).toBe(expectedValue);
  });
});

describe('getExtent', () => {
  test.each([
    [0, [2, 1]],
    [1, [4, 2]],
    [2, [8, 4]],
  ])('should calculate extent when %s', (z, expectedExtent) => {
    const output = tileService.getExtent(z);
    expect(output).toStrictEqual(expectedExtent);
  });
});

describe('pointToTileFraction', () => {
  test.each<[string, number, number, number, number[]]>([
    ['center z0', 0, 0, 0, [1, 0.5, 0]],
    ['center z1', 0, 0, 1, [2, 1, 1]],
    ['center z2', 0, 0, 2, [4, 2, 2]],
    ['top left', -180, 90, 4, [0, 0, 4]],
    ['top right', 180, 90, 4, [32, 0, 4]],
    ['bottom right', 180, -90, 4, [32, 16, 4]],
    ['bottom left', -180, -90, 4, [0, 16, 4]],
    ['nw', -120, 40, 9, [170.66666666, 142.22222222, 9]],
    ['ne', 120, 40, 9, [853.33333333, 142.22222222, 9]],
    ['se', 120, -40, 9, [853.33333333, 369.77777777, 9]],
    ['sw', -120, -40, 9, [170.66666666, 369.77777777, 9]]
  ])('should find tile when %s', (label, lng, lat, z, expectedTile) => {
    const output = tileService.pointToTileFraction(lng, lat, z);
    expect(output).toStrictEqual([
      expect.closeTo(expectedTile[0], 7),
      expect.closeTo(expectedTile[1], 7),
      z,
    ]);
  });
});

describe('pointToTile', () => {
  test.each<[string, number, number, number, number[]]>([
    ['center z0', 0, 0, 0, [1, 0, 0]],
    ['center z1', 0, 0, 1, [2, 1, 1]],
    ['center z2', 0, 0, 2, [4, 2, 2]],
    ['top left', -180, 90, 4, [0, 0, 4]],
    ['top right', 180, 90, 4, [32, 0, 4]],
    ['bottom right', 180, -90, 4, [32, 16, 4]],
    ['bottom left', -180, -90, 4, [0, 16, 4]],
    ['nw', -120, 40, 9, [170, 142, 9]],
    ['ne', 120, 40, 9, [853, 142, 9]],
    ['se', 120, -40, 9, [853, 369, 9]],
    ['sw', -120, -40, 9, [170, 369, 9]]
  ])('should find tile when %s', (label, lng, lat, z, expectedTile) => {
    const output = tileService.pointToTile(lng, lat, z);
    expect(output).toStrictEqual(expectedTile);
  });
});


describe('tilesEqual', () => {
  test.each<[string, number[], number[], boolean]>([
    ['integer', [1, 2, 4], [1, 2, 4], true],
    ['integer x is wrong', [1, 2, 4], [2, 2, 4], false],
    ['integer y is wrong', [1, 2, 4], [1, 3, 4], false],
    ['integer z is wrong', [1, 2, 4], [1, 2, 5], false],
    ['fractional', [1.1, 2.2, 4], [1.1, 2.2, 4], true],
    ['fractional (multiple)', [1, 2, 4], [1.1, 2.2, 4], false],
  ])('should evaluate when %s', (label, a, b, expectedResult) => {
    const output = tileService.tilesEqual(a, b);
    expect(output).toStrictEqual(expectedResult);
  });
});

describe('hasTile', () => {
  test.each<[string, number[][], number[], boolean]>([
    ['zoom 0 w tile', [[0, 0, 2], [1, 2, 2], [2, 2, 2]], [1, 2, 2], true],
    ['zoom 0 e tile', [[0, 0, 2], [0, 1, 2], [2, 1, 2]], [1, 2, 2], false],
  ])('should calculate corrently when %s', (label, tiles, tile, expectedResult) => {
    const output = tileService.hasTile(tiles, tile);
    expect(output).toBe(expectedResult);
  });
});

describe('getSiblings', () => {
  test.each<[string, number[], number[][]]>([
    ['zoom 0 w tile', [0, 0, 0], [[1, 0, 0]]],
    ['zoom 0 e tile', [1, 0, 0], [[0, 0, 0]]],
    ['zoom 1 nw tile', [0, 0, 1], [[1, 0, 1], [0, 1, 1], [1, 1, 1]]],
    ['zoom 1 sw tile', [0, 1, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1]]],
    ['zoom 1 ne tile', [1, 0, 1], [[0, 0, 1], [0, 1, 1], [1, 1, 1]]],
    ['zoom 1 se tile', [1, 1, 1], [[0, 0, 1], [1, 0, 1], [0, 1, 1]]],
    ['zoom 6', [33, 17, 6], [[32, 16, 6], [33, 16, 6], [32, 17, 6]]],
  ])('should get siblings when %s', (label, tile, expectedSiblings) => {
    const output = tileService.getSiblings(tile);
    expect(output).toStrictEqual(expectedSiblings);
  });
});

describe('getParent', () => {
  test.each<[string, number[], number[] | undefined]>([
    ['zoom 0', [1, 0, 0], undefined],
    ['zoom 1 w/ w tile', [0, 0, 1], [0, 0, 0]],
    ['zoom 1 w/ e tile', [3, 0, 1], [1, 0, 0]],
    ['zoom 4 w/ se tile', [5, 5, 4], [2, 2, 3]],
    ['zoom 5 w/ nw tile', [16, 8, 5], [8, 4, 4]],
  ])('should get parent when %s', (label, tile, expectedParent) => {
    const output = tileService.getParent(tile);
    expect(output).toStrictEqual(expectedParent);
  });
});

describe('getChildren', () => {
  test.each<[string, number[], number[][]]>([
    ['zoom 0 w tile', [0, 0, 0], [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]]],
    ['zoom 0 e tile', [1, 0, 0], [[2, 0, 1], [3, 0, 1], [2, 1, 1], [3, 1, 1]]],
    ['zoom 5 w/ nw tile', [16, 8, 5], [[32, 16, 6], [33, 16, 6], [32, 17, 6], [33, 17, 6]]],
  ])('should get children when %s', (label, tile, expectedChildren) => {
    const output = tileService.getChildren(tile);
    expect(output).toStrictEqual(expectedChildren);
  });
});

const quadKeyPairs = [
  // zoom 0
  { quadkey: '0', tile: [0, 0, 0] },
  { quadkey: '1', tile: [1, 0, 0] },

  // zoom 1
  { quadkey: '00', tile: [0, 0, 1] },
  { quadkey: '01', tile: [1, 0, 1] },
  { quadkey: '02', tile: [0, 1, 1] },
  { quadkey: '03', tile: [1, 1, 1] },

  { quadkey: '10', tile: [2, 0, 1] },
  { quadkey: '11', tile: [3, 0, 1] },
  { quadkey: '12', tile: [2, 1, 1] },
  { quadkey: '13', tile: [3, 1, 1] },

  // zoom 2
  { quadkey: '000', tile: [0, 0, 2] },
  { quadkey: '001', tile: [1, 0, 2] },
  { quadkey: '002', tile: [0, 1, 2] },
  { quadkey: '003', tile: [1, 1, 2] },

  { quadkey: '010', tile: [2, 0, 2] },
  { quadkey: '011', tile: [3, 0, 2] },
  { quadkey: '012', tile: [2, 1, 2] },
  { quadkey: '013', tile: [3, 1, 2] },

  { quadkey: '020', tile: [0, 2, 2] },
  { quadkey: '021', tile: [1, 2, 2] },
  { quadkey: '022', tile: [0, 3, 2] },
  { quadkey: '023', tile: [1, 3, 2] },

  { quadkey: '030', tile: [2, 2, 2] },
  { quadkey: '031', tile: [3, 2, 2] },
  { quadkey: '032', tile: [2, 3, 2] },
  { quadkey: '033', tile: [3, 3, 2] },

  { quadkey: '100', tile: [4, 0, 2] },
  { quadkey: '101', tile: [5, 0, 2] },
  { quadkey: '102', tile: [4, 1, 2] },
  { quadkey: '103', tile: [5, 1, 2] },

  { quadkey: '110', tile: [6, 0, 2] },
  { quadkey: '111', tile: [7, 0, 2] },
  { quadkey: '112', tile: [6, 1, 2] },
  { quadkey: '113', tile: [7, 1, 2] },

  { quadkey: '120', tile: [4, 2, 2] },
  { quadkey: '121', tile: [5, 2, 2] },
  { quadkey: '122', tile: [4, 3, 2] },
  { quadkey: '123', tile: [5, 3, 2] },

  { quadkey: '130', tile: [6, 2, 2] },
  { quadkey: '131', tile: [7, 2, 2] },
  { quadkey: '132', tile: [6, 3, 2] },
  { quadkey: '133', tile: [7, 3, 2] },
];

describe('tileToQuadkey', () => {
  test.each(
    quadKeyPairs.map(({ quadkey, tile }) => [tile, quadkey])
  )('should get quadkey when %j', (tile, expectedQuadkey) => {
    const output = tileService.tileToQuadkey(tile);
    expect(output).toBe(expectedQuadkey);
  });
});

describe('quadkeyToTile', () => {
  test.each(
    quadKeyPairs.map(({ quadkey, tile }) => [quadkey, tile])
  )('should get tile when %s', (quadkey, expectedTile) => {
    const output = tileService.quadkeyToTile(quadkey);
    expect(output).toStrictEqual(expectedTile);
  });
});

describe('tileToBBox', () => {
  test.each<[string, number[], number[]]>([
    ['center z0', [1, 0, 0], [0, -90, 180, 90]],
    ['center z1', [2, 1, 1], [0, -90, 90, 0]],
    ['center z2', [4, 2, 2], [0, -45, 45, 0]],
    ['top left', [0, 0, 4], [-180, 78.75, -168.75, 90]],
    ['top right', [31, 0, 4], [168.75, 78.75, 180, 90]],
    ['bottom right', [31, 15, 4], [168.75, -90, 180, -78.75]],
    ['bottom left', [0, 15, 4], [-180, -90, -168.75, -78.75]],
    ['nw', [170, 139, 9], [-120.234375, 40.78125, -119.8828125, 41.1328125]],
    ['ne', [1221, 77, 10], [34.62890625, 76.2890625, 34.8046875, 76.46484375]],
    ['se', [3821, 1946, 11], [155.830078125, -81.123046875, 155.91796875, -81.03515625]],
    ['sw', [3908, 2073, 12], [-8.26171875, -1.142578125, -8.2177734375, -1.0986328125]]
  ])('should find bbox when %s', (label, tile, expectedBbox) => {
    const output = tileService.tileToBBox(tile);
    expect(output).toStrictEqual([
      expect.closeTo(expectedBbox[0], 7),
      expect.closeTo(expectedBbox[1], 7),
      expect.closeTo(expectedBbox[2], 7),
      expect.closeTo(expectedBbox[3], 7),
    ]);
  });
});

describe('bboxToTiles', () => {
  // tile width at zoom 4 is 11.25 so tileWidth * x - 180
  // tile height at zoom 4 is 11.25 so -tileHeight * y + 90
  test.each<[string, number[], number, number[][]]>([
    ['bbox is within one', [-121, 40, -120, 41], 4, [[5, 4, 4]]],
    ['bbox equals one', [45, -78.75, 56.25, -67.5], 4, [[20, 14, 4]]],
    ['bbox intersects many', [-118.125, -39.375, -106.875, -28.125], 4, [
      [5, 10, 4], [5, 11, 4], [6, 10, 4], [6, 11, 4]
    ]]
  ])('should find tiles when %s', (label, bbox, z, expectedTiles) => {
    const output = tileService.bboxToTiles(bbox, z);
    expect(output).toStrictEqual(expectedTiles);
  });
});

describe('tileToGeoJSON', () => {
  test.each([
    [
      [0, 0, 0], 
      { 
        type: 'Polygon', 
        coordinates: [[[-180, 90], [-180, -90], [0, -90], [0, 90], [-180, 90]]] 
      }
    ],
    [
      [5, 4, 4], 
      { 
        type: 'Polygon', 
        coordinates: [[[-123.75, 45], [-123.75, 33.75], [-112.5, 33.75], [-112.5, 45], [-123.75, 45]]] 
      }
    ],
  ])('should get geometry when tile is %j', (tile, expectedGeom) => {
    const output = tileService.tileToGeoJSON(tile);
    expect(output).toStrictEqual(expectedGeom);
  });
});

describe('bboxesIntersect', () => {
  test.each<[string, number[], number[]]>([
    ['a left b', [0, 0, 2, 1], [1, 0, 3, 1]],
    ['a right b', [1, 0, 3, 1], [0, 0, 2, 1]],
    ['a top b', [0, 0, 1, 2], [0, 1, 1, 3]],
    ['a bottom b', [0, 1, 1, 3], [0, 0, 1, 2]],
    ['a contains b', [0, 0, 3, 3], [1, 1, 2, 2]],
    ['a within b', [1, 1, 2, 2], [0, 0, 3, 3]],
    ['a left b (touch)', [0, 0, 1, 1], [1, 0, 2, 1]],
    ['a right b (touch)', [1, 0, 2, 1], [0, 0, 1, 1]],
    ['a top b (touch)', [0, 0, 1, 1], [0, 1, 1, 2]],
    ['a bottom b (touch)', [0, 1, 1, 2], [0, 0, 1, 1]],
  ])('should be truthy when %s', (label, a, b) => {
    const output = tileService.bboxesIntersect(a, b);
    expect(output).toBe(true);
  });

  test.each<[string, number[], number[]]>([
    ['a left b', [0, 0, 1, 1], [2, 0, 3, 1]],
    ['a right b', [2, 0, 3, 1], [0, 0, 1, 1]],
    ['a top b', [0, 0, 1, 1], [0, 2, 1, 3]],
    ['a bottom b', [0, 2, 1, 3], [0, 0, 1, 1]],
  ])('should falsey when %s', (label, a, b) => {
    const output = tileService.bboxesIntersect(a, b);
    expect(output).toBe(false);
  });
});

describe('intersectBboxes', () => {
  test.each<[string, number[], number[], number[]]>([
    ['a left b', [0, 0, 2, 1], [1, 0, 3, 1], [1, 0, 2, 1]],
    ['a right b', [1, 0, 3, 1], [0, 0, 2, 1], [1, 0, 2, 1]],
    ['a top b', [0, 0, 1, 2], [0, 1, 1, 3], [0, 1, 1, 2]],
    ['a bottom b', [0, 1, 1, 3], [0, 0, 1, 2], [0, 1, 1, 2]],
    ['a contains b', [0, 0, 3, 3], [1, 1, 2, 2], [1, 1, 2, 2]],
    ['a within b', [1, 1, 2, 2], [0, 0, 3, 3], [1, 1, 2, 2]],
  ])('should intersect when %s', (label, a, b, expectedBbox) => {
    const output = tileService.intersectBboxes(a, b);
    expect(output).toStrictEqual(expectedBbox);
  });

  test.each<[string, number[], number[]]>([
    ['a left b', [0, 0, 1, 1], [2, 0, 3, 1]],
    ['a right b', [2, 0, 3, 1], [0, 0, 1, 1]],
    ['a top b', [0, 0, 1, 1], [0, 2, 1, 3]],
    ['a bottom b', [0, 2, 1, 3], [0, 0, 1, 1]],
  ])('should return intersection of undefined when %s', (label, a, b) => {
    const output = tileService.intersectBboxes(a, b);
    expect(output).toBeUndefined();
  });
});
