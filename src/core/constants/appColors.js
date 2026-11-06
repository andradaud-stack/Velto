export const APP_COLORS = {
  canvas: '#F4F2FA',
  surface: '#FFFFFF',
  surfaceBorder: '#ECE8F6',
  primary: '#7C4DFF',
  primaryDark: '#6633EE',
  primaryLight: '#8054F6',
  primarySoft: '#F3EEFF',
  deepSlate: '#1E1B2E',
  mutedText: '#6B7280',
  subtleText: '#7E7A9B',
  gain: '#10B981',
  gainSoft: '#ECFDF5',
  loss: '#EF4444',
  lossSoft: '#FEF2F2',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  info: '#6366F1',
  infoSoft: '#EEF2FF',
  gold: '#EAB308',
  goldSoft: '#FEF9C3'
};

export const WALLET_TYPES = {
  LIQUID: 'liquid',
  BANK: 'bank',
  EWALLET: 'ewallet',
  INVESTMENT: 'investment',
  BUSINESS: 'business'
};

export const WALLET_META = {
  cash: {
    id: 'cash',
    name: 'Dompet Cash',
    type: WALLET_TYPES.LIQUID,
    badge: 'Tunai',
    category: 'Kas Operasional',
    color: '#10B981',
    bgColor: '#ECFDF5',
    icon: 'Banknote',
    description: 'Uang fisik & kas harian'
  },
  jago: {
    id: 'jago',
    name: 'Jago Syariah',
    type: WALLET_TYPES.BANK,
    badge: 'Syariah',
    category: 'Rekening Bank Syariah',
    color: '#7C4DFF',
    bgColor: '#F3EEFF',
    icon: 'CreditCard',
    cardNumber: '2343 3333 •••• 1099',
    description: 'Kantong Utama Jago Syariah'
  },
  mandiri: {
    id: 'mandiri',
    name: 'Bank Mandiri',
    type: WALLET_TYPES.BANK,
    badge: 'Bank',
    category: 'Rekening Bank',
    color: '#003D79',
    bgColor: '#EFF6FF',
    icon: 'CreditCard',
    cardNumber: '1420 0188 •••• 9210',
    description: 'Livin by Mandiri'
  },
  dana: {
    id: 'dana',
    name: 'DANA',
    type: WALLET_TYPES.EWALLET,
    badge: 'E-Wallet',
    category: 'Dompet Digital',
    color: '#118EEA',
    bgColor: '#F0F9FF',
    icon: 'Smartphone',
    cardNumber: '0813 2609 ••••',
    description: 'Dompet Digital DANA Indonesia'
  },
  emas: {
    id: 'emas',
    name: 'DANA eMAS',
    type: WALLET_TYPES.INVESTMENT,
    badge: 'Emas',
    category: 'Logam Mulia',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'Coins',
    description: 'Investasi Emas Murni'
  },
  bibit: {
    id: 'bibit',
    name: 'Bibit',
    type: WALLET_TYPES.INVESTMENT,
    badge: 'Investasi',
    category: 'Investasi',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    icon: 'TrendingUp',
    description: 'Portofolio Investasi Bibit'
  },
  parfum: {
    id: 'parfum',
    name: 'Profit Parfum',
    type: WALLET_TYPES.BUSINESS,
    badge: 'Bisnis',
    category: 'Side Hustle',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    icon: 'Sparkles',
    description: 'Kas Laba Bisnis Parfum'
  }
};
