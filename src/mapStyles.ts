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
  isDark: boolean;
};

export const MAP_PALETTES: Record<MapStyleVariant, MapPalette> = {
  standard: {
    headerBackground: '#dbe9e2',
    headerText: '#1f362a',
    headerBorder: '#b7cec0',
    panelBackground: '#ffffff',
    panelText: '#25352c',
    panelBorder: '#c8d8ce',
    accent: '#2e7352',
    selectedOption: '#e5f1e9',
    isDark: false,
  },
  'standard-without-text': {
    headerBackground: '#dbe7ed',
    headerText: '#253844',
    headerBorder: '#bacbd4',
    panelBackground: '#ffffff',
    panelText: '#263740',
    panelBorder: '#c7d6dd',
    accent: '#426b80',
    selectedOption: '#e8f1f5',
    isDark: false,
  },
  greyscale: {
    headerBackground: '#e0e3e2',
    headerText: '#303736',
    headerBorder: '#c4cbca',
    panelBackground: '#ffffff',
    panelText: '#292f2e',
    panelBorder: '#cdd2d1',
    accent: '#596b68',
    selectedOption: '#edf0ef',
    isDark: false,
  },
  'greyscale-without-text': {
    headerBackground: '#d4dadd',
    headerText: '#283238',
    headerBorder: '#b6c0c4',
    panelBackground: '#ffffff',
    panelText: '#293438',
    panelBorder: '#c5cdd0',
    accent: '#526a73',
    selectedOption: '#e8edef',
    isDark: false,
  },
  darkmode: {
    headerBackground: '#17262a',
    headerText: '#f1f3eb',
    headerBorder: '#526368',
    panelBackground: '#26363a',
    panelText: '#f1f3eb',
    panelBorder: '#4b5e62',
    accent: '#e5a064',
    selectedOption: '#34494e',
    isDark: true,
  },
  transparent: {
    headerBackground: '#d8e7e9',
    headerText: '#24414a',
    headerBorder: '#b6cdd0',
    panelBackground: 'rgba(255, 255, 255, 0.96)',
    panelText: '#263b40',
    panelBorder: '#bdd0d2',
    accent: '#197b8a',
    selectedOption: '#e5f1f2',
    isDark: false,
  },
  hybrid: {
    headerBackground: '#35533e',
    headerText: '#f5f4e9',
    headerBorder: '#66816d',
    panelBackground: '#fbfbf5',
    panelText: '#2e392e',
    panelBorder: '#d1d6c7',
    accent: '#a45f34',
    selectedOption: '#edf0e4',
    isDark: false,
  },
  ortofoto: {
    headerBackground: '#e2eddf',
    headerText: '#24372c',
    headerBorder: '#c0d3bf',
    panelBackground: '#ffffff',
    panelText: '#27382d',
    panelBorder: '#cbd9c9',
    accent: '#417349',
    selectedOption: '#eaf2e6',
    isDark: false,
  },
};
