export interface Environment {
  title: string;
  url: string;
}

export const ENVIRONMENTS: Environment[] = [
  { title: 'Staging', url: 'https://devadminapi.mgrant.in' },
  { title: 'Production', url: 'https://portaladminapi.mgrant.in' },
  { title: 'UAT', url: 'https://uatadminapi.mgrant.in' },
  { title: 'QA', url: 'https://qaadminapi.mgrant.in' },
];
