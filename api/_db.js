import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  let url = process.env.DATABASE_URL || 'mysql://4YTXh1WGydcL4yi.root:woPVFUMQf1qw1XsR@gateway01.ap-northeast-1.prod.aws.tidbcloud.com/velto';

  // Auto-fix: if old expired password is still saved in Vercel environment
  if (url.includes('Kj4koBGutgi1lfcb')) {
    url = url.replace('Kj4koBGutgi1lfcb', 'woPVFUMQf1qw1XsR');
  }

  // Auto-fix: ensure username prefix capitalization matches TiDB cluster exactly (capital W)
  if (url.includes('4YTXh1wGydcL4yi')) {
    url = url.replace('4YTXh1wGydcL4yi', '4YTXh1WGydcL4yi');
  }

  // Auto-fix: ensure pointing to user database `velto` instead of restricted system schema `sys`
  if (url.includes('/sys')) {
    url = url.replace('/sys', '/velto');
  }

  dbInstance = connect({ url });
  return dbInstance;
}
