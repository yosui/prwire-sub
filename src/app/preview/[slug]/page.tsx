import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

// 型定義を追加
export type SlugParamsType = Promise<{ slug: string }>;

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

// Required Page component - 同様に更新
export default function PreviewPage() {
  // Redirect to home page when someone visits this URL directly
  redirect('/');
}

