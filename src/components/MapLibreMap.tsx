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
import type { GeoJSON } from 'geojson';
import { getBygningAtPunkt } from '../api/getBygningAtPunkt';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { useEffect, useRef, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';
import { SearchBar, type Address } from './SearchBar';

const TRONDHEIM_COORDS: [number, number] = [10.40565401, 63.4156575];

const KVP_BASE_URL = 'https://kvp.maps.norkart.no/mvt/';

type NorkartBasemapVariant =
  | 'standard'
  | 'standard-without-text'
  | 'greyscale'
  | 'greyscale-without-text'
  | 'darkmode'
  | 'transparent'
  | 'hybrid'
  | 'ortofoto';
const NORKART_BASEMAP_VARIANT: NorkartBasemapVariant = 'ortofoto';

const NORKART_BASEMAP_STYLE = `${KVP_BASE_URL}norkart-basemap/${NORKART_BASEMAP_VARIANT}/style.json`;

const polygonStyle = {
  'fill-outline-color': 'rgba(0,0,0,0.1)',
  'fill-color': 'rgba(178, 59, 140, 0.41)',
};

export const MapLibreMap = () => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);
  const [address, setAddress] = useState<Address | null>(null);
  const [bygningsOmriss, setBygningsOmriss] = useState<GeoJSON | undefined>(
    undefined
  );
  const latestClick = useRef(0);
  const onMapClick = async (e: MapLayerMouseEvent) => {
    const clickId = ++latestClick.current;
    const { lng, lat } = e.lngLat;
    setAddress(null);
    setClickPoint(new LngLat(lng, lat));
    setPointHoydeAtPunkt(undefined);
    setBygningsOmriss(undefined);

    const [bygningResponse, hoyder] = await Promise.all([
      getBygningAtPunkt(lng, lat),
      getHoydeFromPunkt(lng, lat),
    ]);
    if (clickId !== latestClick.current) return;

    setPointHoydeAtPunkt(hoyder[0]?.Z);
    try {
      const omriss = bygningResponse?.FkbData?.BygningsOmriss;
      setBygningsOmriss(omriss ? JSON.parse(omriss) : undefined);
    } catch (error) {
      console.error('Could not parse building geometry:', error);
      setBygningsOmriss(undefined);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <RMap
        minZoom={6}
        initialCenter={TRONDHEIM_COORDS}
        initialZoom={12}
        mapStyle={NORKART_BASEMAP_STYLE}
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

        {address ? (
          <RMarker
            longitude={address.PayLoad.Posisjon.X}
            latitude={address.PayLoad.Posisjon.Y}
            initialColor="#d9482b"
          />
        ) : (
          clickPoint && (
            <RMarker
              longitude={clickPoint.lng}
              latitude={clickPoint.lat}
              initialColor="#d9482b"
            />
          )
        )}

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

        <Overlay>
          <h2>Se her!!!</h2>
          <p>Halla så fin du ser ut i dag</p>
          <SearchBar setAddress={setAddress} />
        </Overlay>

        <DrawComponent />
        {address && (
          <MapFlyTo
            lng={address.PayLoad.Posisjon.X}
            lat={address.PayLoad.Posisjon.Y}
          />
        )}
      </RMap>

      {clickPoint && pointHoyde !== undefined && (
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
          }}
        >
          <strong>Punktinformasjon</strong>
          <div>Latitude: {clickPoint.lat.toFixed(6)}</div>
          <div>Longitude: {clickPoint.lng.toFixed(6)}</div>
          <div>Høyde: {pointHoyde} m</div>
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
