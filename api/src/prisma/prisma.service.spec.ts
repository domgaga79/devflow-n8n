import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  adapterConstructor: vi.fn(),
  prismaConstructor: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class PrismaPgMock {
    constructor(
      options: {
        connectionString: string;
      },
    ) {
      mocks.adapterConstructor(
        options,
      );
    }
  },
}));

vi.mock(
  '../generated/prisma/client.js',
  () => ({
    PrismaClient: class PrismaClientMock {
      constructor(
        options: unknown,
      ) {
        mocks.prismaConstructor(
          options,
        );
      }

      $connect =
        mocks.connect;

      $disconnect =
        mocks.disconnect;
    },
  }),
);

import {
  PrismaService,
} from './prisma.service.js';

describe('PrismaService', () => {
  const originalEnvironment = {
    DATABASE_URL:
      process.env.DATABASE_URL,

    POSTGRES_USER:
      process.env.POSTGRES_USER,

    POSTGRES_PASSWORD:
      process.env.POSTGRES_PASSWORD,

    POSTGRES_DB:
      process.env.POSTGRES_DB,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_DB;

    mocks.connect.mockResolvedValue(
      undefined,
    );

    mocks.disconnect.mockResolvedValue(
      undefined,
    );
  });

  afterEach(() => {
    restoreEnvironmentVariable(
      'DATABASE_URL',
      originalEnvironment.DATABASE_URL,
    );

    restoreEnvironmentVariable(
      'POSTGRES_USER',
      originalEnvironment.POSTGRES_USER,
    );

    restoreEnvironmentVariable(
      'POSTGRES_PASSWORD',
      originalEnvironment.POSTGRES_PASSWORD,
    );

    restoreEnvironmentVariable(
      'POSTGRES_DB',
      originalEnvironment.POSTGRES_DB,
    );
  });

  it('deve utilizar DATABASE_URL quando ela estiver definida', () => {
    process.env.DATABASE_URL =
      'postgresql://user:password@database:5432/devflow?schema=devflow';

    new PrismaService();

    expect(
      mocks.adapterConstructor,
    ).toHaveBeenCalledTimes(
      1,
    );

    expect(
      mocks.adapterConstructor,
    ).toHaveBeenCalledWith({
      connectionString:
        process.env.DATABASE_URL,
    });

    expect(
      mocks.prismaConstructor,
    ).toHaveBeenCalledTimes(
      1,
    );

    expect(
      mocks.prismaConstructor,
    ).toHaveBeenCalledWith({
      adapter:
        expect.any(Object),
    });
  });

  it('deve montar DATABASE_URL a partir das variáveis POSTGRES', () => {
    process.env.POSTGRES_USER =
      'devflow_user';

    process.env.POSTGRES_PASSWORD =
      'devflow_password';

    process.env.POSTGRES_DB =
      'devflow';

    new PrismaService();

    expect(
      mocks.adapterConstructor,
    ).toHaveBeenCalledWith({
      connectionString:
        'postgresql://devflow_user:devflow_password@postgres:5432/devflow?schema=devflow',
    });
  });

  it('deve codificar usuário e senha com caracteres especiais', () => {
    process.env.POSTGRES_USER =
      'dev flow';

    process.env.POSTGRES_PASSWORD =
      'p@ss:/?#[]';

    process.env.POSTGRES_DB =
      'devflow_test';

    const expectedUrl =
      new URL(
        'postgresql://postgres:5432/devflow_test',
      );

    expectedUrl.username =
      'dev flow';

    expectedUrl.password =
      'p@ss:/?#[]';

    expectedUrl.searchParams.set(
      'schema',
      'devflow',
    );

    new PrismaService();

    expect(
      mocks.adapterConstructor,
    ).toHaveBeenCalledWith({
      connectionString:
        expectedUrl.toString(),
    });
  });

  it.each([
    {
      description:
        'POSTGRES_USER',
      user: undefined,
      password: 'password',
      database: 'devflow',
    },

    {
      description:
        'POSTGRES_PASSWORD',
      user: 'user',
      password: undefined,
      database: 'devflow',
    },

    {
      description:
        'POSTGRES_DB',
      user: 'user',
      password: 'password',
      database: undefined,
    },
  ])(
    'deve lançar erro quando $description estiver ausente',
    ({
      user,
      password,
      database,
    }) => {
      if (user !== undefined) {
        process.env.POSTGRES_USER =
          user;
      }

      if (
        password !== undefined
      ) {
        process.env.POSTGRES_PASSWORD =
          password;
      }

      if (
        database !== undefined
      ) {
        process.env.POSTGRES_DB =
          database;
      }

      expect(
        () =>
          new PrismaService(),
      ).toThrow(
        'Configuração do PostgreSQL ausente.',
      );

      expect(
        mocks.adapterConstructor,
      ).not.toHaveBeenCalled();
    },
  );

  it('deve conectar ao PostgreSQL durante onModuleInit', async () => {
    process.env.DATABASE_URL =
      'postgresql://user:password@database:5432/devflow';

    const service =
      new PrismaService();

    await service.onModuleInit();

    expect(
      mocks.connect,
    ).toHaveBeenCalledTimes(
      1,
    );
  });

  it('deve desconectar do PostgreSQL durante onModuleDestroy', async () => {
    process.env.DATABASE_URL =
      'postgresql://user:password@database:5432/devflow';

    const service =
      new PrismaService();

    await service.onModuleDestroy();

    expect(
      mocks.disconnect,
    ).toHaveBeenCalledTimes(
      1,
    );
  });
});

function restoreEnvironmentVariable(
  name: string,
  value: string | undefined,
): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] =
    value;
}
