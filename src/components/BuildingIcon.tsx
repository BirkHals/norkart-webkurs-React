import type { buildingCategories } from '../buildingCategories';

type IconName = keyof typeof buildingCategories | 'pin';

const paths: Record<IconName, string> = {
  home: 'M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8',
  shop: 'M4 10v11h16V10M3 7l2-4h14l2 4v3H3V7ZM3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M8 21v-6h8v6',
  church:
    'M12 2v5M10 4h4M8 11l4-4 4 4v10H8V11ZM8 13l-5 3v5h18v-5l-5-3M11 21v-5h2v5',
  school: 'm2 8 10-5 10 5-10 5L2 8ZM6 10v7c4 3 8 3 12 0v-7M22 8v9',
  other: 'M5 21V3h14v18H5ZM9 7h1m4 0h1M9 11h1m4 0h1M10 21v-6h4v6',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
};

export function BuildingIcon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <path d={paths[name]} />
    </svg>
  );
}
