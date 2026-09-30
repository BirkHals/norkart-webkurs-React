export type TakflateData = {
  TakflateId: string;
  Solinnstraaling: number;
  Januar: number;
  Februar: number;
  Mars: number;
  April: number;
  Mai: number;
  Juni: number;
  Juli: number;
  August: number;
  September: number;
  Oktober: number;
  November: number;
  Desember: number;
  Geometri: string;
};

export const getTakflateDataForPunkt = async (
  x: number,
  y: number
): Promise<TakflateData[]> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  const query = `https://takflater.api.norkart.no/takflater/punkt/utvidet?x=${x}&y=${y}`;

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
      return [];
    }

    const data: { value?: TakflateData[] | null } = await apiResult.json();
    return data.value ?? [];
  } catch (error) {
    console.error('An error occurred while fetching roof data:', error);
    return [];
  }
};
