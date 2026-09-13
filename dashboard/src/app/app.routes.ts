import {
  Routes,
} from '@angular/router';

import {
  Shell,
} from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,

    children: [
      {
        path: '',

        loadComponent: () =>
          import(
            './features/overview/overview'
          ).then(
            (module) =>
              module.Overview,
          ),
      },

      {
        path: 'pull-requests',

        loadComponent: () =>
          import(
            './features/pull-requests/pull-requests'
          ).then(
            (module) =>
              module.PullRequests,
          ),
      },

      {
        path: 'pull-requests/:number',

        loadComponent: () =>
          import(
            './features/pull-request-details/pull-request-details'
          ).then(
            (module) =>
              module.PullRequestDetails,
          ),
      },

      {
        path: 'risk-analysis',

        loadComponent: () =>
          import(
            './features/risk-analysis/risk-analysis'
          ).then(
            (module) =>
              module.RiskAnalysis,
          ),
      },

      {
        path: 'policy-gate',

        loadComponent: () =>
          import(
            './features/policy-gate/policy-gate'
          ).then(
            (module) =>
              module.PolicyGate,
          ),
      },

      {
        path: 'github-events',

        loadComponent: () =>
          import(
            './features/github-events/github-events'
          ).then(
            (module) =>
              module.GithubEvents,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];