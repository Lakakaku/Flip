import { config } from '../config';
import { sleep } from '../utils';

export interface ScrapedListing {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  url: string;
  marketplace: string;
  category: string;
  condition?: string;
  sellerId: string;
  postedAt: Date;
}

export interface ScrapingResult {
  listings: ScrapedListing[];
  totalFound: number;
  errors: string[];
  duration: number;
}

export abstract class BaseScraper {
  protected marketplace: string;
  protected userAgents: string[];
  protected currentProxy?: string;
  
  constructor(marketplace: string) {
    this.marketplace = marketplace;
    this.userAgents = config.scraping.userAgents;
  }
  
  protected async delay(): Promise<void> {
    const min = config.scraping.minDelay;
    const max = config.scraping.maxDelay;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await sleep(delay);
  }
  
  protected getRandomUserAgent(): string {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }
  
  abstract scrapeListings(
    searchTerm: string,
    maxPages?: number
  ): Promise<ScrapingResult>;
  
  abstract isBlocked(): Promise<boolean>;
}

// Specific scrapers will be implemented
export class BlocketScraper extends BaseScraper {
  constructor() {
    super('blocket');
  }
  
  async scrapeListings(
    searchTerm: string,
    maxPages = 1
  ): Promise<ScrapingResult> {
    throw new Error('Blocket scraper not yet implemented');
  }
  
  async isBlocked(): Promise<boolean> {
    return false; // TODO: Implement block detection
  }
}

export class TraderaScraper extends BaseScraper {
  constructor() {
    super('tradera');
  }
  
  async scrapeListings(
    searchTerm: string,
    maxPages = 1
  ): Promise<ScrapingResult> {
    throw new Error('Tradera scraper not yet implemented');
  }
  
  async isBlocked(): Promise<boolean> {
    return false; // TODO: Implement block detection
  }
}

export const scrapers = {
  blocket: new BlocketScraper(),
  tradera: new TraderaScraper()
};