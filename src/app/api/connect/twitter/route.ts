import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTwitterUserByUsername } from '@/lib/twitter-api';
import { saveTwitterInfo, getUserFromRedis } from '@/lib/redis';
import type { NextRequest } from 'next/server';

/**
 * GET: 現在の認証ユーザーのTwitter連携情報を取得
 */
export async function GET() {
  try {
    // 認証情報を取得
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Redisからユーザーデータを取得
    const userData = await getUserFromRedis(userId);
    
    if (!userData || !userData.platforms.twitter) {
      return NextResponse.json(
        { connected: false },
        { status: 200 }
      );
    }

    // Twitter連携情報を返す
    return NextResponse.json({
      connected: true,
      username: userData.platforms.twitter.username,
      followersCount: userData.platforms.twitter.followersCount,
      verifiedAt: userData.platforms.twitter.verifiedAt
    });
  } catch (error) {
    console.error('Error getting Twitter connection:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Twitterユーザー名を受け取り、フォロワー数を取得してRedisに保存
 */
export async function POST(req: NextRequest) {
  try {
    // 認証情報を取得
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // リクエストボディからユーザー名を取得
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Twitter APIからユーザー情報を取得
    const twitterUser = await getTwitterUserByUsername(username);
    
    if (!twitterUser) {
      return NextResponse.json(
        { error: 'Twitter user not found' },
        { status: 404 }
      );
    }

    // Redisにユーザー情報を保存
    const updatedUserData = await saveTwitterInfo(
      userId,
      twitterUser.username,
      twitterUser.followersCount
    );

    // 成功レスポンスを返す
    return NextResponse.json({
      success: true,
      username: twitterUser.username,
      followersCount: twitterUser.followersCount,
      totalFollowers: updatedUserData.totalFollowers,
      verifiedBadge: updatedUserData.verifiedBadge
    });
  } catch (error) {
    console.error('Error connecting Twitter account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 