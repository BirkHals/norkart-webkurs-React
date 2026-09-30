import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAdresserFromSearchText } from '../api/getAdresserFromSearchText';
import type { MapPalette } from '../mapStyles';

export type Address = {
  PayLoad: {
    Posisjon: {
      X: number;
      Y: number;
    };
    Text: string;
  };
};

export const SearchBar = ({
  onAddressSelect,
  palette,
}: {
  onAddressSelect: (address: Address) => void;
  palette: MapPalette;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!searchText) {
      setOptions([]);
      setOpen(false);
      return;
    }

    const identifier = setTimeout(async () => {
      setLoading(true);
      const adresser: Address[] = await getAdresserFromSearchText(searchText);
      setOptions(adresser);
      setLoading(false);
      setOpen(true);
    }, 500);

    return () => {
      clearTimeout(identifier);
    };
  }, [searchText]);

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      sx={{ width: 300, py: 2 }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: palette.panelBackground,
            color: palette.panelText,
            '& .MuiAutocomplete-option[aria-selected="true"]': {
              backgroundColor: palette.selectedOption,
            },
          },
        },
      }}
      open={open}
      onClose={handleClose}
      getOptionLabel={(option) => option.PayLoad.Text}
      options={options}
      loading={loading}
      inputValue={searchText}
      onInputChange={(_, newInputValue) => {
        setSearchText(newInputValue);
      }}
      onChange={(_, selectedOption) => {
        if (selectedOption) {
          onAddressSelect(selectedOption);
          setOpen(false);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Adressesøk"
          sx={{
            '& .MuiInputLabel-root': { color: palette.panelText },
            '& .MuiOutlinedInput-root': {
              color: palette.panelText,
              backgroundColor: palette.panelBackground,
              '& fieldset': { borderColor: palette.panelBorder },
              '&:hover fieldset': { borderColor: palette.accent },
              '&.Mui-focused fieldset': { borderColor: palette.accent },
            },
            '& .MuiSvgIcon-root': { color: palette.panelText },
          }}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
};
