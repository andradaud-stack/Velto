import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  let url = process.env.DATABASE_URL || (
    process.env.TIDB_HOST 
      ? `mysql://${process.env.TIDB_USER}:${encodeURIComponent(process.env.TIDB_PASSWORD || '')}@${process.env.TIDB_HOST}:${process.env.TIDB_PORT || 4000}/${process.env.TIDB_DATABASE || 'velto'}`
      : 'mysql://4YTXh1WGydcL4yi.root:woPVFUMQf1qw1XsR@gateway01.ap-northeast-1.prod.aws.tidbcloud.com/velto'
  );

  // Ensure username prefix capitalization matches TiDB cluster exactly
  if (url.includes('4YTXh1wGydcL4yi')) {
    url = url.replace('4YTXh1wGydcL4yi', '4YTXh1WGydcL4yi');
  }

  // Ensure pointing to user database `velto` instead of restricted system schema `sys`
  if (url.includes('/sys')) {
    url = url.replace('/sys', '/velto');
  }

  dbInstance = connect({ url });
  return dbInstance;
}
