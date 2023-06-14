import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    if (process.env.NODE_ENV === 'development') {
      return {
        type: 'sqlite',
        synchronize: false,
        database: this.configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
      };
    } else if (process.env.NODE_ENV === 'test') {
      return {
        type: 'sqlite',
        synchronize: false,
        database: this.configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        migrationsRun: true,
      };
    } else if (process.env.NODE_ENV === 'production') {
      return {
        type: 'postgres',
        synchronize: false,
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
      };
    }
  }
}
