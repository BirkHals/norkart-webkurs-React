type AdresseSokResultat = {
  adressetekst?: string;
  postnummer?: string;
  poststed?: string;
};

export const getAdresseAtPunkt = async (
  lng: number,
  lat: number
): Promise<string | null> => {
  const query = `https://ws.geonorge.no/adresser/v1/punktsok?lat=${lat}&lon=${lng}&radius=100&treffPerSide=1`;

  try {
    const apiResult = await fetch(query, {
      headers: { Accept: 'application/json' },
    });

    if (!apiResult.ok) {
      console.error('Address lookup failed with status:', apiResult.status);
      return null;
    }

    const data: { adresser?: AdresseSokResultat[] } = await apiResult.json();
    const adresse = data.adresser?.[0];

    if (!adresse?.adressetekst) {
      return null;
    }

    const poststed = [adresse.postnummer, adresse.poststed]
      .filter(Boolean)
      .join(' ');

    return poststed
      ? `${adresse.adressetekst}, ${poststed}`
      : adresse.adressetekst;
  } catch (error) {
    console.error('An error occurred while looking up the address:', error);
    return null;
  }
};
