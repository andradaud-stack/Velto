import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  // Verified TiDB Cloud Serverless parameters (Cluster: Dev-Team)
  // Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com
  // User: 4YTXh1WGydcL4yi.root (Exact case-sensitive prefix with capital W)
  // Pass: woPVFUMQf1qw1XsR
  // Database: velto
  const host = 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
  const username = '4YTXh1WGydcL4yi.root';
  const password = process.env.TIDB_PASSWORD || 'woPVFUMQf1qw1XsR';
  const database = 'velto';

  dbInstance = connect({
    host,
    username,
    password,
    database
  });

  return dbInstance;
}
