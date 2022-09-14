tilebelt-wgs84
====
![version](https://img.shields.io/github/package-json/v/bwswedberg/tilebelt-wgs84)
![build](https://github.com/bwswedberg/tilebelt-wgs84/actions/workflows/build.yml/badge.svg)
[![codecov](https://codecov.io/gh/bwswedberg/tilebelt-wgs84/branch/main/graph/badge.svg?token=R9NCYUYWL1)](https://codecov.io/gh/bwswedberg/tilebelt-wgs84)

Simple tile utilities for [WGS84](https://en.wikipedia.org/wiki/World_Geodetic_System) (EPSG:4326). Inspired by [tilebelt](https://github.com/mapbox/tilebelt) which is for web mercator (EPSG:3857).

## Install

```bash
npm install tilebelt-wgs84
```

## Usage

```ts
import tilebelt from 'tilebelt-wgs84';

// [x, y, z]
const tile = [10, 15, 8];
console.log(tilebelt.tileToGeoJSON(tile));

// [lngMin, latMin, lngmax, latMax]
const bbox = [-118.125, -39.375, -106.875, -28.125];
console.log(tilebelt.bboxToTiles(bbox, 4);
```

## API

function | description
---|---
tileToGeoJSON(tile) | Get a geojson representation of a tile
tileToBBox(tile) | Get the bbox of a tile
bboxToTiles(bbox, zoom) | Gets tiles needed to cover a bbox
getChildren(tile) | Get the 4 tiles one zoom level higher (2 tiles at zoom 0)
getParent(tile) | Get the tile one zoom level lower
getSiblings(tile) | Get the 3 sibling tiles for a tile (1 sibling at zoom 0)
hasTile(tiles, tile) | Check to see if an array of tiles contains a tile
tilesEqual(tileA, tileB) | Check to see if two tiles are the same
tileToQuadkey(tile) | Get the quadkey for a tile
quadkeyToTile(quadkey) | Get the tile for a quadkey
pointToTile(lng, lat, zoom) | Get the tile for a point at a specified zoom level
pointToTileFraction(lng, lat, zoom) | Get the precise fractional tile location for a point at a zoom level
**Additional utility functions**
normalizeLng(number) | Translate longitude to left and scale so that -180 is 0 and 180 is 1
normalizeLat(number) | Translate latitude to the top and scale so that 90 is 0 and -90 is 1
getExtent(zoom) | Get the total x (columns) and y (rows) tiles at given the zoom level
bboxesIntersect | Checks if two bboxes intersect
intersectBboxes(bbox, bbox) | Get the intersection of two bboxes

## Tests

```bash
npm run lint
npm run test
```
