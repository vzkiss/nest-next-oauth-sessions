import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Feedback } from '../../../../packages/api/dist/entry';

const entities = [User, Feedback];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}', ...entities],
        synchronize: configService.get('nodeEnv') !== 'production', // auto creates tables in dev
        // logging: configService.get("nodeEnv") === "development", // show SQL queris in console
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
