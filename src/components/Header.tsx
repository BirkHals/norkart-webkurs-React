import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import NorkartLogo from '../assets/norkart_logo.svg';
import {
  MAP_STYLE_OPTIONS,
  type MapPalette,
  type MapStyleVariant,
} from '../mapStyles';

type HeaderProps = {
  mapStyle: MapStyleVariant;
  onMapStyleChange: (mapStyle: MapStyleVariant) => void;
  palette: MapPalette;
};

const Header = ({ mapStyle, onMapStyleChange, palette }: HeaderProps) => {
  const styles = {
    backgroundColor: palette.headerBackground,
    color: palette.headerText,
    borderBottom: `1px solid ${palette.headerBorder}`,
    transition: 'background-color 180ms ease, color 180ms ease',
  };

  return (
    <header className="app-header" style={styles}>
      <div className="app-header__brand">
        <img height="42" src={NorkartLogo} alt="Norkart" />
        <h1 className="app-header__title">Norkart Workshop</h1>
      </div>
      <FormControl className="app-header__style-control" size="small">
        <InputLabel
          id="map-style-label"
          sx={{
            color: palette.headerText,
            '&.Mui-focused': { color: palette.accent },
          }}
        >
          Bakgrunnskart
        </InputLabel>
        <Select
          labelId="map-style-label"
          value={mapStyle}
          label="Bakgrunnskart"
          onChange={(event) =>
            onMapStyleChange(event.target.value as MapStyleVariant)
          }
          sx={{
            color: palette.headerText,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.headerBorder,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.accent,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.accent,
            },
            '& .MuiSvgIcon-root': { color: palette.headerText },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: palette.panelBackground,
                color: palette.panelText,
                '& .MuiMenuItem-root.Mui-selected': {
                  backgroundColor: palette.selectedOption,
                },
              },
            },
          }}
        >
          {MAP_STYLE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </header>
  );
};

export default Header;
