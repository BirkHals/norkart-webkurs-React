export type Bygning = {
  MatrikkelData?: {
    Bygningstype?: string | null;
    Naringsgruppe?: string | null;
  } | null;
  FkbData?: { BygningsOmriss?: string | null } | null;
};

export const getBygningAtPunkt = async (
  x: number,
  y: number
): Promise<Bygning | undefined> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  const query = `https://bygning.api.norkart.no/bygninger/byposition?x=${x}&y=${y}&MaxRadius=1&GeometryTextFormat=GeoJson&IncludeFkbData=true`;

  try {
    const apiResult = await fetch(query, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-WAAPI-TOKEN': `${apiKey}`,
      },
    });
    if (!apiResult.ok) {
      console.error('API request failed with status:', apiResult.status);
      return undefined;
    }
    const data: { Bygninger?: Bygning[] } = await apiResult.json();
    return data.Bygninger?.[0];
  } catch (error) {
    console.error('An error occurred while fetching building data:', error);
    return undefined;
  }
};
