export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '104560933562-fq59domirr6lj1dee565l92d7a7ib86b.apps.googleusercontent.com';
  return res.status(200).json({
    clientId
  });
}
