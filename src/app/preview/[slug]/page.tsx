import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

// 型定義を追加
export type SlugParamsType = Promise<{ slug: string }>;

// Force static generation for better crawler access
export const dynamic = 'force-static';

// Generate metadata for the page with OG tags
export async function generateMetadata({
  params,
}: {
  params: SlugParamsType;
}): Promise<Metadata> {
  // パラメータをawaitで取得
  const { slug } = await params;
  const parts = slug.split('-');
  
  if (parts.length < 3) {
    return {
      title: 'PRWire',
      description: 'Verify your Power for The People with PRWire',
    };
  }
  
  const username = parts[0];
  // Get followers count from parts
  const followersCount = parts[1] || '0';
  // We'll still keep the parts but use a simplified URL format
  const randomParam = parts[2]; 
  
  // 確実に絶対URLを使用するために、baseURLを設定
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verify.prwi.re';
  // URLオブジェクトを使用して絶対URLを確実に構築
  const ogImageUrl = new URL('/api/og', baseUrl);
  
  // クエリパラメータを設定
  ogImageUrl.searchParams.set('username', username);
  ogImageUrl.searchParams.set('followers', followersCount);
  ogImageUrl.searchParams.set('r', randomParam);
  
  // 最終的なURLを文字列として取得
  const ogImageUrlString = ogImageUrl.toString();
  
  // コンソールにメタデータの生成を記録
  console.log(`[OGP] Generating metadata for user: ${username}, followers: ${followersCount}`);
  console.log(`[OGP] OG Image URL: ${ogImageUrlString}`);
  
  return {
    title: `@${username}'s Verified Follower Count | PRWire`,
    description: `See @${username}'s verified follower count on X, verified by PRWire.`,
    openGraph: {
      title: `@${username}'s Verified Follower Count | PRWire`,
      description: `See @${username}'s verified follower count on X, verified by PRWire.`,
      images: [
        {
          url: ogImageUrlString,
          width: 1200,
          height: 630,
          alt: `@${username}'s verified follower count`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `@${username}'s Verified Follower Count | PRWire`,
      description: `See @${username}'s verified follower count on X, verified by PRWire.`,
      images: [ogImageUrlString],
      creator: `@${username}`,
    },
  };
}

// Required Page component - サーバーコンポーネントを非同期に変更
export default async function PreviewPage({
  params,
}: {
  params: SlugParamsType;
}) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // パラメータをawaitで取得
  const { slug } = await params;
  
  // User-Agentとスラグをログに記録（デバッグ用）
  console.log(`[Preview] User-Agent: ${userAgent}`);
  console.log(`[Preview] Slug: ${slug}`);
  
  // Twitterの様々なボットを確実に検出
  const twitterBots = [
    'twitterbot',
    'twitter',
    'x bot',
    'x-bot',
    'xbot',
  ];
  
  // 一般的なクローラーの配列
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
  
  // User-Agent文字列を小文字に変換して保存
  const userAgentLower = userAgent.toLowerCase();
  
  // Twitter/X Botの検出
  const isTwitterBot = twitterBots.some(bot => userAgentLower.includes(bot));
  
  // その他のクローラーの検出
  const isOtherCrawler = otherCrawlers.some(crawler => userAgentLower.includes(crawler));
  
  // クローラーかどうかの最終判定
  const isCrawler = isTwitterBot || isOtherCrawler;
  
  // デバッグログ
  console.log(`[Preview] Is Twitter Bot: ${isTwitterBot}`);
  console.log(`[Preview] Is Other Crawler: ${isOtherCrawler}`);
  console.log(`[Preview] Final Crawler Decision: ${isCrawler}`);
  
  // クローラーでない場合はリダイレクト
  if (!isCrawler) {
    console.log(`[Preview] Redirecting non-crawler to home page`);
    redirect('/');
  }
  
  // クローラーの場合のみ静的ページを表示（通常のユーザーはここに到達しない）
  console.log(`[Preview] Showing static page for crawler`);
  const parts = slug.split('-');
  const username = parts[0];
  const followersCount = Number.parseInt(parts[1] || '0', 10);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">PRWire Follower Verification</h1>
      <div className="mb-6">
        <p className="text-xl font-semibold">@{username}</p>
        <p className="text-3xl font-bold text-blue-500">{followersCount.toLocaleString()} followers</p>
      </div>
      <p className="text-lg mb-8">検証済みのフォロワー数です</p>
      <Link href="/" className="text-blue-500 underline">ホームページに戻る</Link>
    </div>
  );
}

