export const MAP_STYLE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'standard-without-text', label: 'Standard uten tekst' },
  { value: 'greyscale', label: 'Gråtoner' },
  { value: 'greyscale-without-text', label: 'Gråtoner uten tekst' },
  { value: 'darkmode', label: 'Mørk modus' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'ortofoto', label: 'Ortofoto' },
] as const;

export type MapStyleVariant = (typeof MAP_STYLE_OPTIONS)[number]['value'];

export type MapPalette = {
  headerBackground: string;
  headerText: string;
  headerBorder: string;
  panelBackground: string;
  panelText: string;
  panelBorder: string;
  accent: string;
  selectedOption: string;
};

const lightPalette: MapPalette = {
  headerBackground: '#e2eddf',
  headerText: '#24372c',
  headerBorder: '#c0d3bf',
  panelBackground: '#ffffff',
  panelText: '#27382d',
  panelBorder: '#cbd9c9',
  accent: '#417349',
  selectedOption: '#eaf2e6',
};

const darkPalette: MapPalette = {
  headerBackground: '#17262a',
  headerText: '#f1f3eb',
  headerBorder: '#526368',
  panelBackground: '#26363a',
  panelText: '#f1f3eb',
  panelBorder: '#4b5e62',
  accent: '#e5a064',
  selectedOption: '#34494e',
};

export const MAP_PALETTES: Record<MapStyleVariant, MapPalette> = {
  standard: lightPalette,
  'standard-without-text': lightPalette,
  greyscale: lightPalette,
  'greyscale-without-text': lightPalette,
  darkmode: darkPalette,
  transparent: lightPalette,
  hybrid: lightPalette,
  ortofoto: lightPalette,
};
