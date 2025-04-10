import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhook/new-content',
  '/feed',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/preview/(.*)',
  '/api/og(.*)'
])

// クローラーを検出する関数
function isCrawler(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  const userAgentLower = userAgent.toLowerCase();
  
  // Twitterの様々なボットの検出
  const twitterBots = [
    'twitterbot',
    'twitter',
    'x bot',
    'x-bot',
    'xbot',
  ];
  
  // 一般的なクローラーの検出
  const otherCrawlers = [
    'bot',
    'crawler',
    'spider',
    'slurp',
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'facebookexternalhit',
    'linkedinbot',
    'slackbot',
    'discordbot',
    'telegrambot',
    'whatsapp',
  ];
  
  // いずれかのボットを含むか確認
  const isTwitterBot = twitterBots.some(bot => userAgentLower.includes(bot));
  const isOtherCrawler = otherCrawlers.some(crawler => userAgentLower.includes(crawler));
  
  return isTwitterBot || isOtherCrawler;
}

export default clerkMiddleware(async (auth, req) => {
  // プレビューページへのアクセスでクローラーの場合は処理を続行
  if (req.url.includes('/preview/') && isCrawler(req)) {
    console.log(`[Middleware] Crawler detected for preview page: ${req.headers.get('user-agent')}`);
    return NextResponse.next();
  }
  
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 