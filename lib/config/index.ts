export const config = {
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database
  database: {
    minPriceRecords: 50000,
    cacheTimeout: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  },
  
  // Scraping
  scraping: {
    minDelay: 2000, // 2 seconds
    maxDelay: 5000, // 5 seconds
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    userAgents: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ]
  },
  
  // Marketplaces
  marketplaces: {
    blocket: {
      name: 'Blocket',
      baseUrl: 'https://www.blocket.se',
      enabled: true
    },
    tradera: {
      name: 'Tradera',
      baseUrl: 'https://www.tradera.com',
      enabled: true
    },
    facebook: {
      name: 'Facebook Marketplace',
      baseUrl: 'https://www.facebook.com/marketplace',
      enabled: false // Requires special handling
    }
  },
  
  // Notifications
  notifications: {
    discord: {
      enabled: true,
      webhook: process.env.DISCORD_WEBHOOK_URL
    },
    email: {
      enabled: false // Will be enabled in production
    }
  },
  
  // Subscriptions
  subscriptions: {
    freemium: {
      name: 'Freemium',
      maxNotifications: 5,
      features: ['basic_deals']
    },
    silver: {
      name: 'Silver',
      maxNotifications: 50,
      features: ['basic_deals', 'advanced_filters']
    },
    gold: {
      name: 'Gold',
      maxNotifications: -1, // unlimited
      features: ['basic_deals', 'advanced_filters', 'api_access', 'analytics']
    }
  }
};