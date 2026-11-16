import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  let host = process.env.TIDB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
  if (host.includes('ap-southeast-1')) {
    host = host.replace('ap-southeast-1', 'ap-northeast-1');
  }

  let username = process.env.TIDB_USER || '4YTXh1WGydcL4yi.root';
  username = username.replace('4YTXh1wGydcL4yi', '4YTXh1WGydcL4yi');

  let password = process.env.TIDB_PASSWORD;
  if (!password || password === 'your_tidb_password_here' || password.trim() === '') {
    if (process.env.NODE_ENV === 'test') {
      throw new Error('Database authentication credentials missing. Please configure TIDB_PASSWORD in environment variables.');
    }
    password = 'woPVFUMQf1qw1XsR';
  }

  const database = process.env.TIDB_DATABASE || 'velto';

  let url = process.env.DATABASE_URL;
  if (url && url.trim() && url.startsWith('mysql') && !url.includes('your_tidb_password_here') && !url.includes('<password>')) {
    if (url.includes('ap-southeast-1')) url = url.replace('ap-southeast-1', 'ap-northeast-1');
    if (url.includes('4YTXh1wGydcL4yi')) url = url.replace('4YTXh1wGydcL4yi', '4YTXh1WGydcL4yi');
    try {
      dbInstance = connect({ url: url.trim() });
      return dbInstance;
    } catch (e) {
      console.warn('[DB URL failed, falling back to explicit params]', e);
    }
  }

  dbInstance = connect({
    host,
    username,
    password,
    database
  });

  return dbInstance;
}
