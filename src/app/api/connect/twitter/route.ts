import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getTwitterUserByUsername, 
  getTwitterAuthUrl
} from '@/lib/twitter-api';
import { saveTwitterInfo, getUserFromRedis } from '@/lib/redis';
import type { NextRequest } from 'next/server';

/**
 * GET: 現在の認証ユーザーのTwitter連携情報を取得または認証フローを開始
 */
export async function GET(req: NextRequest) {
  try {
    // クエリパラメータを確認
    const { searchParams } = new URL(req.url);
    const startOAuth = searchParams.get('oauth');
    
    // 認証情報を取得
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // OAuth認証フローを開始する場合
    if (startOAuth === 'true') {
      try {
        // Twitter認証URLを取得
        const authUrl = await getTwitterAuthUrl();
        
        // リダイレクト
        return NextResponse.redirect(authUrl);
      } catch (error) {
        console.error('OAuth initialization error:', error);
        return NextResponse.json(
          { error: 'Failed to initialize OAuth flow' },
          { status: 500 }
        );
      }
    }
    
    // 通常のGETリクエスト（連携情報取得）
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
    let username: string;
    
    // Content-Typeに基づいてリクエストボディを解析
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // JSONデータの場合
      const body = await req.json();
      username = body.username;
    } else {
      // フォームデータの場合
      const formData = await req.formData();
      username = formData.get('username') as string;
    }

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