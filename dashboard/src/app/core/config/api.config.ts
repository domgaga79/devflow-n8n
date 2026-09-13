import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>(
  'DEVFLOW_API_BASE_URL',
);

export const DEVFLOW_API_BASE_URL =
  'http://localhost:3000/api';