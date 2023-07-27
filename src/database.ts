import sqlite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Database } from './database-types';

const sqliteDb = new sqlite('repology.db')
sqliteDb.pragma('journal_mode = WAL')
const dialect = new SqliteDialect({
    database: sqliteDb,
});

export const db = new Kysely<Database>({
    dialect
});

export const createTablesIfNotExists = async () => {
    await db.schema.dropTable('project_provider').ifExists().execute();
    await db.schema.dropTable('project').ifExists().execute();

    await db.schema.createTable('project')
        .addColumn('name', 'varchar(150)', it => it.primaryKey().notNull())
    .execute();
    
    await db.schema.createTable('project_provider')
        .addColumn('id', 'integer', it => it.primaryKey().notNull().autoIncrement())
        .addColumn('project_name', 'varchar(255)', it => it.notNull().references('project.name'))
        .addColumn('repository', 'varchar(255)', it => it.notNull())
        .addColumn('sub_repository', 'varchar(255)')
        .addColumn('source_name', 'varchar(255)')
        .addColumn('visible_name', 'varchar(255)')
        .addColumn('binary_name', 'varchar(255)')
        .addColumn('version', 'varchar(255)', it => it.notNull())
        .addColumn('original_version', 'varchar(255)')
        .addColumn('status', 'varchar(255)')
        .addColumn('summary', 'varchar(255)')
    .execute();
}