import {
  LngLat,
  type MapLayerMouseEvent,
  type RequestTransformFunction,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  RLayer,
  RMap,
  RMarker,
  RSource,
  useMap,
} from 'maplibre-react-components';
import type {
  FeatureCollection,
  GeoJSON,
  Geometry,
  Polygon,
  Position,
} from 'geojson';
import { getAdresseAtPunkt } from '../api/getAdresseAtPunkt';
import { getBygningAtPunkt } from '../api/getBygningAtPunkt';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import {
  getTakflateDataForPunkt,
  type TakflateData,
} from '../api/getTakflateDataForPunkt';
import { useEffect, useRef, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';
import { SearchBar, type Address } from './SearchBar';
import type { MapPalette, MapStyleVariant } from '../mapStyles';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const TRONDHEIM_COORDS: [number, number] = [10.40565401, 63.4156575];

const KVP_BASE_URL = 'https://kvp.maps.norkart.no/mvt/';

const polygonStyle = {
  'fill-outline-color': 'rgba(0,0,0,0.1)',
  'fill-color': 'rgba(178, 59, 140, 0.41)',
};

const roofStyle = {
  'fill-outline-color': '#7a285f',
  'fill-color': 'rgba(237, 174, 54, 0.7)',
};

const MONTHS: {
  label: string;
  field: keyof Omit<TakflateData, 'TakflateId' | 'Geometri'>;
}[] = [
  { label: 'Januar', field: 'Januar' },
  { label: 'Februar', field: 'Februar' },
  { label: 'Mars', field: 'Mars' },
  { label: 'April', field: 'April' },
  { label: 'Mai', field: 'Mai' },
  { label: 'Juni', field: 'Juni' },
  { label: 'Juli', field: 'Juli' },
  { label: 'August', field: 'August' },
  { label: 'September', field: 'September' },
  { label: 'Oktober', field: 'Oktober' },
  { label: 'November', field: 'November' },
  { label: 'Desember', field: 'Desember' },
];

const pointIsInRing = (lng: number, lat: number, ring: Position[]) => {
  let isInside = false;

  for (
    let index = 0, previousIndex = ring.length - 1;
    index < ring.length;
    previousIndex = index++
  ) {
    const [currentLng, currentLat] = ring[index];
    const [previousLng, previousLat] = ring[previousIndex];
    const crossesLatitude =
      currentLat > lat !== previousLat > lat &&
      lng <
        ((previousLng - currentLng) * (lat - currentLat)) /
          (previousLat - currentLat) +
          currentLng;

    if (crossesLatitude) isInside = !isInside;
  }

  return isInside;
};

const pointIsInPolygon = (lng: number, lat: number, polygon: Polygon) => {
  const [outerRing, ...holes] = polygon.coordinates;
  return (
    pointIsInRing(lng, lat, outerRing) &&
    holes.every((hole) => !pointIsInRing(lng, lat, hole))
  );
};

const pointIsInGeometry = (lng: number, lat: number, geometry: Geometry) => {
  if (geometry.type === 'Polygon') {
    return pointIsInPolygon(lng, lat, geometry);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((coordinates) =>
      pointIsInPolygon(lng, lat, { type: 'Polygon', coordinates })
    );
  }

  return false;
};

type MapLibreMapProps = {
  mapStyle: MapStyleVariant;
  palette: MapPalette;
};

export const MapLibreMap = ({ mapStyle, palette }: MapLibreMapProps) => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [pointAddress, setPointAddress] = useState<string | null | undefined>(
    undefined
  );
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);
  const [address, setAddress] = useState<Address | null>(null);
  const [bygningsOmriss, setBygningsOmriss] = useState<GeoJSON | undefined>(
    undefined
  );
  const [isBuilding, setIsBuilding] = useState<boolean | undefined>(undefined);
  const [takflater, setTakflater] = useState<TakflateData[] | undefined>(
    undefined
  );
  const latestClick = useRef(0);

  const loadDataAtPoint = async (
    lng: number,
    lat: number,
    selectedAddress?: string
  ) => {
    const clickId = ++latestClick.current;
    setClickPoint(new LngLat(lng, lat));
    setPointAddress(selectedAddress);
    setPointHoydeAtPunkt(undefined);
    setBygningsOmriss(undefined);
    setIsBuilding(undefined);
    setTakflater(undefined);

    const [bygningResponse, hoyder] = await Promise.all([
      getBygningAtPunkt(lng, lat),
      getHoydeFromPunkt(lng, lat),
    ]);
    if (clickId !== latestClick.current) return;

    setPointHoydeAtPunkt(hoyder[0]?.Z);

    let parsedOutline: GeoJSON | undefined;
    try {
      const omriss = bygningResponse?.FkbData?.BygningsOmriss;
      parsedOutline = omriss ? (JSON.parse(omriss) as GeoJSON) : undefined;
    } catch (error) {
      console.error('Could not parse building geometry:', error);
    }

    setBygningsOmriss(parsedOutline);
    const foundBuilding = Boolean(parsedOutline);
    setIsBuilding(foundBuilding);

    if (!foundBuilding) {
      setPointAddress(null);
      setTakflater([]);
      return;
    }

    const [allTakflater, nearbyAddress] = await Promise.all([
      getTakflateDataForPunkt(lng, lat),
      selectedAddress ? Promise.resolve(null) : getAdresseAtPunkt(lng, lat),
    ]);
    if (clickId !== latestClick.current) return;

    setPointAddress(selectedAddress ?? nearbyAddress);
    const takflateData = allTakflater.filter((takflate) => {
      try {
        return pointIsInGeometry(
          lng,
          lat,
          JSON.parse(takflate.Geometri) as Geometry
        );
      } catch (error) {
        console.error('Could not parse roof geometry:', error);
        return false;
      }
    });
    setTakflater(takflateData);
  };

  const onMapClick = (e: MapLayerMouseEvent) => {
    setAddress(null);
    void loadDataAtPoint(e.lngLat.lng, e.lngLat.lat);
  };

  const onAddressSelect = (selectedAddress: Address) => {
    const { X: lng, Y: lat } = selectedAddress.PayLoad.Posisjon;
    setAddress(selectedAddress);
    void loadDataAtPoint(lng, lat, selectedAddress.PayLoad.Text);
  };

  const takflateGeoJson: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: (takflater ?? []).flatMap((takflate) => {
      try {
        return [
          {
            type: 'Feature' as const,
            geometry: JSON.parse(takflate.Geometri) as Geometry,
            properties: { TakflateId: takflate.TakflateId },
          },
        ];
      } catch (error) {
        console.error('Could not parse roof geometry:', error);
        return [];
      }
    }),
  };

  return (
    <div style={{ position: 'relative' }}>
      <RMap
        minZoom={6}
        initialCenter={TRONDHEIM_COORDS}
        initialZoom={12}
        mapStyle={`${KVP_BASE_URL}norkart-basemap/${mapStyle}/style.json`}
        initialTransformRequest={transformRequest}
        style={{
          height: `calc(100dvh - var(--header-height))`,
        }}
        onClick={onMapClick}
      >
        {bygningsOmriss && (
          <>
            <RSource id="bygning" type="geojson" data={bygningsOmriss} />
            <RLayer
              source="bygning"
              id="bygning-fill"
              type="fill"
              paint={polygonStyle}
            />
          </>
        )}

        {takflateGeoJson.features.length > 0 && (
          <>
            <RSource id="takflater" type="geojson" data={takflateGeoJson} />
            <RLayer
              source="takflater"
              id="takflater-fill"
              type="fill"
              paint={roofStyle}
            />
          </>
        )}

        {clickPoint && (
          <RMarker
            longitude={clickPoint.lng}
            latitude={clickPoint.lat}
            initialColor="#da1d9e"
          />
        )}

        <Overlay
          style={{
            backgroundColor: palette.panelBackground,
            color: palette.panelText,
            border: `1px solid ${palette.panelBorder}`,
            borderRadius: 8,
          }}
        >
          <h2>Se her!!!</h2>
          <p>Halla så fin du ser ut i dag</p>
          <SearchBar onAddressSelect={onAddressSelect} palette={palette} />
        </Overlay>

        <DrawComponent />
        {address && (
          <MapFlyTo
            lng={address.PayLoad.Posisjon.X}
            lat={address.PayLoad.Posisjon.Y}
          />
        )}
      </RMap>

      {clickPoint && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            padding: 16,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 2px 8px #0003',
            backgroundColor: palette.panelBackground,
            color: palette.panelText,
            border: `1px solid ${palette.panelBorder}`,
            width: 360,
            maxWidth: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
            overflowY: 'auto',
          }}
        >
          <strong>
            {isBuilding ? 'Bygningsinformasjon' : 'Punktinformasjon'}
          </strong>
          <div>Latitude: {clickPoint.lat.toFixed(6)}</div>
          <div>Longitude: {clickPoint.lng.toFixed(6)}</div>
          <div>
            Høyde: {pointHoyde === undefined ? 'Henter...' : `${pointHoyde} m`}
          </div>
          {isBuilding === undefined ? (
            <div>Kontrollerer om punktet ligger på en bygning...</div>
          ) : isBuilding ? (
            <>
              <div>
                Adresse:{' '}
                {pointAddress === undefined
                  ? 'Henter...'
                  : (pointAddress ?? 'Fant ingen adresse nær punktet.')}
              </div>
              <h3>Solmengde for tak</h3>
              {takflater === undefined ? (
                <div>Henter takdata...</div>
              ) : takflater.length === 0 ? (
                <div>
                  Bygningen er markert rosa, men det finnes ingen takflater
                  eller soldata for den.
                </div>
              ) : (
                takflater.map((takflate) => (
                  <section key={takflate.TakflateId}>
                    <strong>Takflate {takflate.TakflateId}</strong>
                    <div>Årssum: {takflate.Solinnstraaling} kWh/m²</div>
                    <TableContainer
                      component={Paper}
                      sx={{
                        mt: 1,
                        maxHeight: 220,
                        boxShadow: 'none',
                        backgroundColor: palette.panelBackground,
                        border: `1px solid ${palette.panelBorder}`,
                      }}
                    >
                      <Table
                        size="small"
                        aria-label="Solmengde per måned"
                        sx={{
                          '& .MuiTableCell-root': {
                            color: palette.panelText,
                            borderColor: palette.panelBorder,
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Måned</TableCell>
                            <TableCell align="right">kWh/m²</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {MONTHS.map(({ label, field }) => (
                            <TableRow key={field}>
                              <TableCell component="th" scope="row">
                                {label}
                              </TableCell>
                              <TableCell align="right">
                                {takflate[field]}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </section>
                ))
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

function MapFlyTo({ lng, lat }: { lng: number; lat: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lng, lat], zoom: 20, speed: 10 });
  }, [lng, lat, map]);

  return null;
}

const transformRequest: RequestTransformFunction = (url) => {
  if (!url.startsWith(KVP_BASE_URL)) {
    return { url };
  }

  const apiKey = import.meta.env.VITE_API_KEY;
  const separator = url.includes('?') ? '&' : '?';
  return { url: `${url}${separator}api_key=${encodeURIComponent(apiKey)}` };
};
