import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import { TypeOrmConfigService } from './config/typeorm-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the ConfigModule available everywhere in the app
      envFilePath: `.env.${process.env.NODE_ENV}`, // This is the file where we will store our environment variables
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE, // This is the token that tells Nest to use our custom pipe
      useValue: new ValidationPipe({
        whitelist: true, // This tells the ValidationPipe to strip away any properties that do not have any decorators
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {} // This is how we inject the ConfigService

  configure(consumer: MiddlewareConsumer) {
    // This code is executed during the application initialization.
    // Inside we can set some middleware that will run before any incoming request.
    consumer
      .apply(
        session({
          secret: this.configService.get('COOKIE_KEY'),
          resave: false,
          saveUninitialized: false,
        }),
      )
      .forRoutes('*'); // forRoutes('*') means for all routes --> Global Middleware
  }
}
