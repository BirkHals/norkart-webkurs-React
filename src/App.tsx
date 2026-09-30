import { useState } from 'react';
import Header from './components/Header';
import { MapLibreMap } from './components/MapLibreMap';
import { MAP_PALETTES, type MapStyleVariant } from './mapStyles';
import './index.css';

function App() {
  const [mapStyle, setMapStyle] = useState<MapStyleVariant>('ortofoto');
  const palette = MAP_PALETTES[mapStyle];

  return (
    <>
      <Header
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        palette={palette}
      />
      <MapLibreMap mapStyle={mapStyle} palette={palette} />
    </>
  );
}

export default App;
