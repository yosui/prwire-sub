import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveTwitterInfo, getTwitterCodeVerifier } from '@/lib/redis';
import axios from 'axios';
import { TWITTER_OAUTH2_TOKEN_URL, TWITTER_API_BASE_URL } from '@/lib/twitter-api';

/**
 * Twitter OAuth 2.0認証のユーザー情報取得
 */
async function getTwitterUserInfo(accessToken: string) {
  try {
    console.log("Fetching user info with token:", `${accessToken.substring(0, 10)}...`);
    
    // ユーザー情報を取得（meエンドポイント）
    const response = await axios.get(`${TWITTER_API_BASE_URL}/users/me`, {
      params: {
        'user.fields': 'public_metrics',
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("User info API response received:", JSON.stringify(response.data, null, 2));
    const userData = response.data.data;
    
    if (!userData) {
      throw new Error('Failed to get user data');
    }

    return {
      username: userData.username,
      followersCount: userData.public_metrics?.followers_count || 0,
    };
  } catch (error) {
    console.error('Error fetching Twitter user info:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * GET: Twitter OAuth認証コールバック処理
 */
export async function GET(req: NextRequest) {
  try {
    // 認証情報を取得
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-in?error=unauthorized`
      );
    }

    // クエリパラメータを確認
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_code&tab=sns`
      );
    }
    
    if (!state) {
      console.error('Missing state parameter');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_state&tab=sns`
      );
    }
    
    try {
      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;
      
      // 環境変数の読み込み状況を確認
      console.log("Environment variables check:");
      console.log("- NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
      console.log("- TWITTER_CLIENT_ID:", clientId ? `${clientId.substring(0, 5)}...` : 'Missing');
      console.log("- TWITTER_CLIENT_SECRET:", clientSecret ? `${clientSecret.substring(0, 5)}...` : 'Missing');
      
      if (!clientId || !clientSecret) {
        throw new Error('Twitter API credentials are not configured');
      }
      
      // リダイレクトURI - 末尾のスラッシュを処理
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const redirectUri = `${normalizedBaseUrl}/api/auth/twitter/callback`;
      
      // グローバル変数の代わりにRedisからcode verifierを取得
      const codeVerifier = await getTwitterCodeVerifier(state);
      
      if (!codeVerifier) {
        console.error('Code verifier not found for the provided state');
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_state&tab=sns`
        );
      }
      
      console.log("Using code verifier:", `${codeVerifier.substring(0, 10)}...`);
      
      // 認証コードをアクセストークンと交換
      try {
        console.log("Attempting to exchange code for token with:", {
          code: `${code.substring(0, 10)}...`,
          redirect_uri: redirectUri,
          client_id: clientId ? 'Present' : 'Missing',
          client_secret: clientSecret ? 'Present' : 'Missing',
          code_verifier: `${codeVerifier.substring(0, 10)}...`,
          endpoint: TWITTER_OAUTH2_TOKEN_URL
        });
        
        // Basic認証用のトークンを生成（client_id:client_secretをBase64エンコード）
        const basicAuthToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        // リクエストの詳細をログ出力
        const params = {
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        };
        
        const requestBody = new URLSearchParams(params).toString();
        
        console.log("Request parameters:", JSON.stringify(params));
        console.log("Request body:", requestBody);
        console.log("Authorization header:", `Basic ${basicAuthToken.substring(0, 10)}...`);
        
        const tokenResponse = await axios.post(
          TWITTER_OAUTH2_TOKEN_URL,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${basicAuthToken}`
            },
          }
        );
        
        console.log("Token response received");
        const accessToken = tokenResponse.data.access_token;
        
        if (!accessToken) {
          console.error("Access token missing in response:", tokenResponse.data);
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_token&tab=sns`
          );
        }
        
        // ユーザー情報を取得
        console.log("Fetching user info with token");
        const twitterUser = await getTwitterUserInfo(accessToken);
        
        if (!twitterUser) {
          console.error("Twitter user info not found");
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=user_not_found&tab=sns`
          );
        }
        
        console.log("Saving user info to Redis:", twitterUser);
        // Redisにユーザー情報を保存
        await saveTwitterInfo(
          userId,
          twitterUser.username,
          twitterUser.followersCount
        );
        
        // ダッシュボードにリダイレクト（成功メッセージ付き）
        console.log("Authentication successful, redirecting to dashboard");
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?twitter_success=true&tab=sns`
        );
      } catch (error: unknown) {
        console.error('Twitter OAuth callback error:', error);
        
        // エラーの詳細をログに出力
        if (axios.isAxiosError(error) && error.response) {
          // サーバーからのレスポンスがある場合
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (axios.isAxiosError(error) && error.request) {
          // リクエストが行われたがレスポンスがない場合
          console.error('Request made but no response received:', error.request);
        } else {
          // リクエスト設定時のエラー
          console.error('Error setting up request:', error instanceof Error ? error.message : String(error));
        }
        
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_error&tab=sns`
        );
      }
    } catch (error) {
      console.error('Authentication error in OAuth callback:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=server_error&tab=sns`
      );
    }
  } catch (error) {
    console.error('Authentication error in OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=server_error&tab=sns`
    );
  }
} 