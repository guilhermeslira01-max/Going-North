import axios from 'axios';
import { getCached, setWithTimestamp, getTimestamp, formatTimestamp, TTL } from '../middleware/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Indicator {
  name: string;
  value: number;
  unit: string;
  cachedAt: string | null;
}

export interface IndicatorsData {
  cdi: Indicator;
  selic: Indicator;
  ipca: Indicator;
  dolar: Indicator;
  bitcoin: Indicator;
  ethereum: Indicator;
  cachedAt: string | null;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

export interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
}

// ─── BCB (Banco Central) ─────────────────────────────────────────────────────

async function fetchBCBSeries(series: number): Promise<number> {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series}/dados/ultimos/1?formato=json`;
  const { data } = await axios.get<Array<{ valor: string }>>(url, { timeout: 8000 });
  return parseFloat(data[0].valor);
}

// ─── AwesomeAPI (Dólar) ───────────────────────────────────────────────────────

async function fetchDolar(): Promise<{ bid: number; pctChange: number }> {
  const { data } = await axios.get<{ USDBRL: { bid: string; pctChange: string } }>(
    'https://economia.awesomeapi.com.br/json/last/USD-BRL',
    { timeout: 8000 }
  );
  return {
    bid: parseFloat(data.USDBRL.bid),
    pctChange: parseFloat(data.USDBRL.pctChange),
  };
}

// ─── CoinGecko (Cripto) ───────────────────────────────────────────────────────

interface CoinGeckoResponse {
  bitcoin: { brl: number; brl_24h_change: number };
  ethereum: { brl: number; brl_24h_change: number };
}

async function fetchCrypto(): Promise<CoinGeckoResponse> {
  const { data } = await axios.get<CoinGeckoResponse>(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl&include_24hr_change=true',
    { timeout: 8000 }
  );
  return data;
}

// ─── Indicators (combined) ────────────────────────────────────────────────────

const INDICATORS_KEY = 'indicators:all';

export async function getIndicators(forceRefresh = false): Promise<IndicatorsData> {
  if (!forceRefresh) {
    const cached = getCached<IndicatorsData>(INDICATORS_KEY);
    if (cached) return cached;
  }

  const [cdi, selic, ipca, dolar, crypto] = await Promise.all([
    fetchBCBSeries(12),
    fetchBCBSeries(432),
    fetchBCBSeries(433),
    fetchDolar(),
    fetchCrypto(),
  ]);

  const ts = getTimestamp(INDICATORS_KEY);
  const result: IndicatorsData = {
    cdi: { name: 'CDI', value: cdi, unit: '% a.a.', cachedAt: ts ? formatTimestamp(ts) : null },
    selic: { name: 'Selic', value: selic, unit: '% a.a.', cachedAt: ts ? formatTimestamp(ts) : null },
    ipca: { name: 'IPCA', value: ipca, unit: '% a.a.', cachedAt: ts ? formatTimestamp(ts) : null },
    dolar: { name: 'Dólar', value: dolar.bid, unit: 'BRL', cachedAt: ts ? formatTimestamp(ts) : null },
    bitcoin: { name: 'Bitcoin', value: crypto.bitcoin.brl, unit: 'BRL', cachedAt: ts ? formatTimestamp(ts) : null },
    ethereum: { name: 'Ethereum', value: crypto.ethereum.brl, unit: 'BRL', cachedAt: ts ? formatTimestamp(ts) : null },
    cachedAt: null,
  };

  setWithTimestamp(INDICATORS_KEY, result, TTL.BCB);
  const newTs = getTimestamp(INDICATORS_KEY);
  result.cachedAt = newTs ? formatTimestamp(newTs) : null;
  result.cdi.cachedAt = result.cachedAt;
  result.selic.cachedAt = result.cachedAt;
  result.ipca.cachedAt = result.cachedAt;
  result.dolar.cachedAt = result.cachedAt;
  result.bitcoin.cachedAt = result.cachedAt;
  result.ethereum.cachedAt = result.cachedAt;

  return result;
}

// ─── GNews ────────────────────────────────────────────────────────────────────

const GNEWS_KEY = 'gnews:financas';

export async function getNews(forceRefresh = false): Promise<{ articles: NewsArticle[]; cachedAt: string | null }> {
  if (!forceRefresh) {
    const cached = getCached<{ articles: NewsArticle[]; cachedAt: string | null }>(GNEWS_KEY);
    if (cached) return cached;
  }

  const ts = getTimestamp(GNEWS_KEY);
  // Enforce minimum 30min between calls
  if (ts && Date.now() - ts < TTL.GNEWS * 1000) {
    const cached = getCached<{ articles: NewsArticle[]; cachedAt: string | null }>(GNEWS_KEY);
    if (cached) return cached;
  }

  const { data } = await axios.get<{ articles: NewsArticle[] }>(
    `https://gnews.io/api/v4/search?q=finanças OR investimento OR economia&lang=pt&country=br&max=20&apikey=${process.env.GNEWS_API_KEY}`,
    { timeout: 10000 }
  );

  const result = {
    articles: data.articles,
    cachedAt: formatTimestamp(Date.now()),
  };

  setWithTimestamp(GNEWS_KEY, result, TTL.GNEWS);
  return result;
}

// ─── Brapi (B3 Stocks) ────────────────────────────────────────────────────────

const BRAPI_TICKERS = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'WEGE3', 'RENT3', 'ABEV3', 'HGLG11', 'KNRI11', 'MXRF11'];
const BRAPI_KEY = 'brapi:quotes';

interface BrapiResponse {
  results: StockQuote[];
}

export async function getStockQuotes(forceRefresh = false): Promise<{ quotes: StockQuote[]; cachedAt: string | null }> {
  if (!forceRefresh) {
    const cached = getCached<{ quotes: StockQuote[]; cachedAt: string | null }>(BRAPI_KEY);
    if (cached) return cached;
  }

  const tickers = BRAPI_TICKERS.join(',');
  const { data } = await axios.get<BrapiResponse>(
    `https://brapi.dev/api/quote/${tickers}?token=${process.env.BRAPI_TOKEN}`,
    { timeout: 10000 }
  );

  const result = {
    quotes: data.results,
    cachedAt: formatTimestamp(Date.now()),
  };

  setWithTimestamp(BRAPI_KEY, result, TTL.BRAPI);
  return result;
}

// ─── Anthropic (AI Articles) ─────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const articleCache = new Map<string, string>();

export async function generateArticle(topic: string): Promise<string> {
  const key = topic.toLowerCase().trim();

  if (articleCache.has(key)) {
    return articleCache.get(key)!;
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `Você é um educador financeiro brasileiro experiente.
Escreva artigos educativos sobre finanças pessoais e investimentos de forma clara, didática e prática.
Responda SEMPRE em HTML puro formatado, usando tags como <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
Adapte a linguagem para o público brasileiro, usando exemplos locais e referências ao mercado financeiro nacional.
Seja informativo, objetivo e evite jargões desnecessários.`,
    messages: [
      {
        role: 'user',
        content: `Escreva um artigo educativo completo sobre: ${topic}.
O artigo deve ter introdução, desenvolvimento com tópicos principais, exemplos práticos e conclusão.
Formate em HTML com no mínimo 600 palavras.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from AI');

  const html = content.text;
  articleCache.set(key, html); // permanent cache
  return html;
}
