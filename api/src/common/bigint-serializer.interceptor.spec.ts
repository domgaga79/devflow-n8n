import type {
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';

import {
  firstValueFrom,
  of,
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  BigIntSerializerInterceptor,
} from './bigint-serializer.interceptor.js';

describe('BigIntSerializerInterceptor', () => {
  let interceptor:
    BigIntSerializerInterceptor;

  beforeEach(() => {
    interceptor =
      new BigIntSerializerInterceptor();
  });

  it('deve converter BigInt para string recursivamente', async () => {
    const date = new Date(
      '2026-09-13T20:00:00.000Z',
    );

    const source = {
      id: 123n,
      name: 'DevFlow',
      enabled: true,
      count: 10,
      empty: null,
      optional: undefined,
      createdAt: date,

      items: [
        1n,
        2n,
        'texto',
        null,
        {
          nestedId: 999n,
        },
      ],

      nested: {
        pullRequest: {
          id: 50n,
          score: 12,
        },
      },
    };

    const handle = vi.fn(
      () => of(source),
    );

    const next = {
      handle,
    } as unknown as CallHandler;

    const context =
      {} as ExecutionContext;

    const result =
      await firstValueFrom(
        interceptor.intercept(
          context,
          next,
        ),
      );

    expect(handle).toHaveBeenCalledTimes(
      1,
    );

    expect(result).toEqual({
      id: '123',
      name: 'DevFlow',
      enabled: true,
      count: 10,
      empty: null,
      optional: undefined,
      createdAt: date,

      items: [
        '1',
        '2',
        'texto',
        null,
        {
          nestedId: '999',
        },
      ],

      nested: {
        pullRequest: {
          id: '50',
          score: 12,
        },
      },
    });
  });

  it('deve converter BigInt quando ele for o valor raiz', async () => {
    const next = {
      handle: vi.fn(
        () => of(987654321n),
      ),
    } as unknown as CallHandler;

    const result =
      await firstValueFrom(
        interceptor.intercept(
          {} as ExecutionContext,
          next,
        ),
      );

    expect(result).toBe(
      '987654321',
    );
  });

  it('deve preservar Date quando ela for o valor raiz', async () => {
    const date = new Date(
      '2026-09-13T20:30:00.000Z',
    );

    const next = {
      handle: vi.fn(
        () => of(date),
      ),
    } as unknown as CallHandler;

    const result =
      await firstValueFrom(
        interceptor.intercept(
          {} as ExecutionContext,
          next,
        ),
      );

    expect(result).toBe(
      date,
    );
  });

  it('deve preservar valores primitivos sem BigInt', async () => {
    const next = {
      handle: vi.fn(
        () => of('DevFlow'),
      ),
    } as unknown as CallHandler;

    const result =
      await firstValueFrom(
        interceptor.intercept(
          {} as ExecutionContext,
          next,
        ),
      );

    expect(result).toBe(
      'DevFlow',
    );
  });
});
