export interface Environment {
  title: string;
  url: string;
}

export const ENVIRONMENTS: Environment[] = [
  { title: 'Staging', url: 'https://devadminapi.mgrant.in' },
  { title: 'QA', url: 'https://qaadminapi.mgrant.in' },
  { title: 'UAT', url: 'https://uatadminapi.mgrant.in' },
  { title: 'ICICI UAT', url: 'https://uaticicifadminapi.mgrant.in' },
  { title: 'Sattva UAT', url: 'https://uatsattvaadminapi.mgrant.in' },
  { title: 'Production', url: 'https://portaladminapi.mgrant.in' },
  { title: 'ICICI PROD', url: 'https://icicifadminapi.mgrant.in' },
  { title: 'Sattva PROD', url: 'https://sattvaadminapi.mgrant.in' },
  { title: 'TRIF PROD', url: 'https://trifmgrantadminapi.dhwaniris.com' },
];
