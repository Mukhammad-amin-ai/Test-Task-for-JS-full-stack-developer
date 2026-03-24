import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

dotenv.config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  entities: ['dist/api/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  seeds: ['dist/database/seeds/*{.ts,.js}'],
  factories: ['dist/database/factories/**/*{.ts,.js}'],
  seedTracking: false,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.NODE_ENV === 'development',
  cache: true,
};

const dataSource = new DataSource(dataSourceOptions);
console.log(dataSource.options);
export default dataSource;

dataSource.initialize();
