import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const url = process.env.DATABASE_URL || (
    process.env.TIDB_HOST 
      ? `mysql://${process.env.TIDB_USER}:${encodeURIComponent(process.env.TIDB_PASSWORD || '')}@${process.env.TIDB_HOST}:${process.env.TIDB_PORT || 4000}/${process.env.TIDB_DATABASE || 'velto'}?ssl={"rejectUnauthorized":true}`
      : null
  );

  if (!url) {
    throw new Error('Database connection URL is missing. Set DATABASE_URL or TIDB_HOST in environment variables.');
  }

  dbInstance = connect({ url });
  return dbInstance;
}
