import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const url = process.env.DATABASE_URL;
  const host = process.env.TIDB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
  let username = process.env.TIDB_USER;
  const password = process.env.TIDB_PASSWORD;
  const database = process.env.TIDB_DATABASE || 'velto';

  if (url && url.trim()) {
    dbInstance = connect({ url: url.trim() });
    return dbInstance;
  }

  if (!username || !password) {
    throw new Error('Database authentication credentials missing. Please configure TIDB_USER and TIDB_PASSWORD in environment variables.');
  }

  // Ensure username prefix capitalization matches TiDB cluster exactly if user has lowercase typo
  if (username.includes('4YTXh1wGydcL4yi')) {
    username = username.replace('4YTXh1wGydcL4yi', '4YTXh1WGydcL4yi');
  }

  dbInstance = connect({
    host,
    username,
    password,
    database
  });

  return dbInstance;
}
