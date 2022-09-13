
/**
 * Translate longitude to left and scale so that -180 is 0 and 180 is 1
 * 
 * @param lng longitude in decimal degrees
 * @returns value between 0 and 1
 */
 export const normalizeLng = (lng: number) => lng / 360 + 0.5;


 /**
  * Translate latitude to the top and scale so that -90 is 1 and 90 is 0
  * 
  * @param lat latitude in decimal degrees
  * @returns value between 0 and 1
  */
 export const normalizeLat = (lat: number) => -lat / 180 + 0.5;

/**
 * Get the total x (columns) and y (rows) tiles at given the zoom level.
 * e.g. zoom 0 is [2, 1], zoom 1 is [4, 2], zoom 2 is [8, 4]
 * 
 * @param z zoom
 * @returns amount of tiles
 */
 export const getExtent = (z: number): number[] => {
  const fz = Math.floor(z);
  // same as [2**(z+1), 2**(z)] but slightly faster
  return [2 << fz, 1 << fz];
};


/**
 * Get the precise fractional tile location for a point at a zoom level
 * 
 * @param lng longitude in decimal degrees
 * @param lat latitude in decimal degrees
 * @param z zoom
 * @returns tile [x, y, z]
 */
export const pointToTileFraction = (lng: number, lat: number, z: number): number[] => {
  // Calculate total tiles at the zoom level
  const [matrixWidth, matrixHeight] = getExtent(z);
  
  // Translate lngLat from merdian to top left corner
  // Then normalize/scale by total degrees to get 0 to 1 based results
  const dx = normalizeLng(lng);
  const dy = normalizeLat(lat); 
  
  // Find fractional tile grid
  const x = dx * matrixWidth;
  const y = dy * matrixHeight;
  
  return [x, y, z];
};


/**
 * Get the tile for a point at a specified zoom level
 * 
 * @param lng longitude in decimal degrees
 * @param lat latitude in decimal degrees
 * @param z zoom
 * @returns tile [x, y, z]
 */
export const pointToTile = (lng: number, lat: number, z: number): number[] => {
  const tile = pointToTileFraction(lng, lat, z);
  return [
    Math.floor(tile[0]),
    Math.floor(tile[1]),
    tile[2]
  ];
};


/**
 * Check to see if two tiles are the same
 * 
 * @param tileA [x, y, z]
 * @param tileB [x, y, z]
 * @returns 
 */
 export const tilesEqual = ([ax, ay, az]: number[], [bx, by, bz]: number[]) => {
  return ax === bx && ay === by && az === bz;
};


/**
 * Check to see if an array of tiles contains a tile
 * 
 * @param tiles [[x, y, z], ...]
 * @param tile [x, y, z]
 * @returns
 */
export const hasTile = (tiles: number[][], tile: number[]) => {
  return tiles.some(otherTile => tilesEqual(tile, otherTile));
};


/**
 * Get the 3 sibling tiles for a tile (1 sibiling at zoom 0)
 * 
 * @param tile [x, y, z]
 * @returns sibling tiles
 */
 export const getSiblings = (tile: number[]) => {
  // Handle zoom 0 edge case. Zoom 0 is a 2x1 matrix
  if (tile[2] === 0) return [tile[0] % 2 ? [0, 0, 0] : [1, 0, 0]];

  // Find northwest tile (top left). Northwest tile is always even
  const w = tile[0] - (tile[0] % 2);
  const n = tile[1] - (tile[1] % 2);
  return [
    [w, n, tile[2]],
    [w + 1, n, tile[2]],
    [w, n + 1, tile[2]],
    [w + 1, n + 1, tile[2]],
  ].filter(sibling => !tilesEqual(sibling, tile)); // remove identity
};


/**
 * Get the tile one zoom level lower
 * 
 * @param tile [x, y, z]
 * @returns tile [x, y, z]
 */
 export const getParent = ([x, y, z]: number[]): number[] | undefined => {
  if (z === 0) return;
  return [
    Math.floor(x / 2), 
    Math.floor(y / 2), 
    z - 1
  ];
};


/**
 * Get the 4 tiles one zoom level higher (2 tiles at zoom 0)
 * 
 * @param tile [x, y, z]
 * @returns children tiles
 */
 export const getChildren = ([x, y, z]: number[]) => {
  const cz = z + 1;
  const cx = Math.floor(x) * 2;
  const cy = Math.floor(y) * 2;
  return [
    [cx, cy, cz],
    [cx + 1, cy, cz],
    [cx, cy + 1, cz],
    [cx + 1, cy + 1, cz],
  ];
};


/**
 * Get the quadkey for a tile
 *
 * @param tile [x, y, z]
 * @returns quadkey string
 */
 export const tileToQuadkey = (tile: number[]) => {
  let quadkey = '';
  let _tile: number[] | undefined = tile;
  do {
    const [x, y] = _tile;
    const zKey = x % 2 ? (y % 2 ? 3 : 1) : (y % 2 ? 2 : 0);
    quadkey = zKey + quadkey;
  } while (_tile = getParent(_tile));
  return quadkey;
};

/**
 * Get the tile for a quadkey
 *
 * @param quadkey (e.g. '01023', '012', '1030')
 * @returns tile [x, y, z]
 */
 export const quadkeyToTile = (quadkey: string): number[] => {
  const z = quadkey.length - 1;
  const [matrixWidth, matrixHeight] = getExtent(z);
  let x = 0;
  let y = 0;
  for (let i = 0; i <= z; i++) {
    const tileWidth = matrixWidth / (2 << i);
    const tileHeight = matrixHeight / (1 << i);
    const key = quadkey[i];
    const xOffset = key === '0' || key === '2' ? 0 : 1;
    const yOffset = key === '0' || key === '1' ? 0 : 1;
    x += tileWidth * xOffset;
    y += tileHeight * yOffset;
  }
  return [x, y, z];
};


/**
 * Gets tiles needed to cover a bbox
 * 
 * @param bbox [lngMin, latMin, lntMax, latMax]
 * @param z zoom
 * @returns tiles [[x, y, z], ...]
 */
 export const bboxToTiles = (bbox: number[], z: number): number[][] => {
  const tlTile = pointToTileFraction(bbox[0], bbox[3], z);
  const brTile = pointToTileFraction(bbox[2], bbox[1], z);
  const tiles = [];
  // Floor so that we can apply gt and lt operator
  for (let x = Math.floor(tlTile[0]); x < brTile[0]; x++) {
    for (let y = Math.floor(tlTile[1]); y < brTile[1]; y++) {
      tiles.push([ x, y, z ]);
    }
  }
  return tiles;
};

/**
 * Get the bbox of a tile
 * 
 * @param tile [x, y, z]
 * @returns [lngMin, latMin, lngMax, latMax]
 */
export const tileToBBox = ([x, y, z]: number[]): number[] => {
  // Calculate total tiles at the zoom level
  const [matrixWidth, matrixHeight] = getExtent(z);

  // Width and height in degrees
  const tileWidth = 360 / matrixWidth;
  const tileHeight = 180 / matrixHeight;

  // Normalized x and y
  // dx and dy correspond to the top left corner (xmin, ymax)
  const dx = x / matrixWidth;
  const dy = y / matrixHeight;

  // Convert to lng and lat
  const lng = dx * 360 - 180; // xMin (left)
  const lat = -dy * 180 + 90; // yMax (top)

  return [lng, lat - tileHeight, lng + tileWidth, lat];
};

/**
 * Get a geojson representation of a tile
 * 
 * @param tile [x, y, z]
 * @returns a GeoJSON geometry
 */
export const tileToGeoJSON = (tile: number[]) => {
  const bbox = tileToBBox(tile);
  return {
    type: "Polygon",
    coordinates: [[
      [bbox[0], bbox[3]],
      [bbox[0], bbox[1]],
      [bbox[2], bbox[1]],
      [bbox[2], bbox[3]],
      [bbox[0], bbox[3]]
    ]]
  };
};


/**
 * Get the intersection of two boxes as a bbox
 * 
 * @param a bbox as [xmin, ymin, xmax, ymax]
 * @param b bbox as [xmin, ymin, xmax, ymax]
 * @returns The intersection of `a` and `b` as [xmin, ymin, xmax, ymax] or undefined when disjoint
 */
 export const intersectBboxes = (a: number[], b: number[]): number[] | undefined => {
  const xIntersects =
    (a[0] <= b[0] && b[0] <= a[2])
    || (a[0] <= b[2] && b[2] <= a[2])
    || (b[0] <= a[0] && a[0] <= b[2])
    || (b[0] <= a[2] && a[2] <= b[2]);

  if (!xIntersects) return;

  const yIntersects = 
    (a[1] <= b[1] && b[1] <= a[3])
    || (a[1] <= b[3] && b[3] <= a[3])
    || (b[1] <= a[1] && a[1] <= b[3])
    || (b[1] <= a[3] && a[3] <= b[3]);

  if (!yIntersects) return;

  // find shared area
  const xMin = Math.max(a[0], b[0]);
  const xMax = Math.min(a[2], b[2]);
  const yMin = Math.max(a[1], b[1]);
  const yMax = Math.min(a[3], b[3]);

  return [xMin, yMin, xMax, yMax];
};
