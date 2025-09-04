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

export const ENVIRONMENTS1 = [
  { key: 'dev', name: 'DEV', baseUrl: 'https://devadminapi.mgrant.in' },
  { key: 'qa', name: 'QA', baseUrl: 'https://qaadminapi.mgrant.in' },
  { key: 'saas_uat', name: 'SaaS UAT', baseUrl: 'https://uatadminapi.mgrant.in' },
  { key: 'saas_prod', name: 'SaaS PROD', baseUrl: 'https://portaladminapi.mgrant.in' },
  { key: 'icici_uat', name: 'ICICI UAT', baseUrl: 'https://uaticicifadminapi.mgrant.in' },
  { key: 'sattva_uat', name: 'Sattva UAT', baseUrl: 'https://uatsattvaadminapi.mgrant.in' },
  { key: 'icici_prod', name: 'ICICI PROD', baseUrl: 'https://icicifadminapi.mgrant.in' },
  { key: 'sattva_prod', name: 'Sattva PROD', baseUrl: 'https://sattvaadminapi.mgrant.in' },
  { key: 'trif_prod', name: 'TRIF PROD', baseUrl: 'https://trifmgrantadminapi.dhwaniris.com' },
];
