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
  
  // Create the OG image URL with explicit parameters
  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://verify.prwi.re'}/api/og?username=${encodeURIComponent(username)}&followers=${followersCount}&r=${randomParam}`;
  
  return {
    title: `@${username}'s Verified Follower Count | PRWire`,
    description: `See @${username}'s verified follower count on X, verified by PRWire.`,
    openGraph: {
      title: `@${username}'s Verified Follower Count | PRWire`,
      description: `See @${username}'s verified follower count on X, verified by PRWire.`,
      images: [
        {
          url: ogImageUrl,
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
      images: [ogImageUrl],
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
  
  // Twitter/X Bot または他のクローラーの場合は静的ページを表示
  const isCrawler = userAgent.toLowerCase().includes('twitterbot') || 
                    userAgent.toLowerCase().includes('bot') ||
                    userAgent.toLowerCase().includes('crawler') ||
                    userAgent.toLowerCase().includes('spider');
  
  // クローラーでない場合はリダイレクト
  if (!isCrawler) {
    redirect('/');
  }
  
  // クローラーの場合のみ静的ページを表示（通常のユーザーはここに到達しない）
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

