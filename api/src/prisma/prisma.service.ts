import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString =
      PrismaService.getConnectionString();

    const adapter = new PrismaPg({
      connectionString,
    });

    super({
      adapter,
    });
  }

  private static getConnectionString(): string {
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }

    const user = process.env.POSTGRES_USER;
    const password = process.env.POSTGRES_PASSWORD;
    const database = process.env.POSTGRES_DB;

    if (!user || !password || !database) {
      throw new Error(
        'Configuração do PostgreSQL ausente. Defina DATABASE_URL ou POSTGRES_USER, POSTGRES_PASSWORD e POSTGRES_DB.',
      );
    }

    const url = new URL(
      `postgresql://postgres:5432/${database}`,
    );

    url.username = user;
    url.password = password;
    url.searchParams.set('schema', 'devflow');

    return url.toString();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}