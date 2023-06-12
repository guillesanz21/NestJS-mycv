import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the ConfigModule available everywhere in the app
      envFilePath: `.env.${process.env.NODE_ENV}`, // This is the file where we will store our environment variables
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], // This tells Nest to inject the ConfigService into the factory function
      async useFactory(config: ConfigService) {
        return {
          type: 'sqlite',
          database: config.get<string>('DB_NAME'),
          entities: [User, Report],
          synchronize: true, // This will automatically create tables for us based on the entities we defined
        };
      },
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
  configure(consumer: MiddlewareConsumer) {
    // This code is executed during the application initialization.
    // Inside we can set some middleware that will run before any incoming request.
    consumer
      .apply(
        session({
          secret: 'my-secret', // In a real app, this should be stored in an environment variable
          resave: false,
          saveUninitialized: false,
        }),
      )
      .forRoutes('*'); // forRoutes('*') means for all routes --> Global Middleware
  }
}
