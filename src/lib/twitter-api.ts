import axios from 'axios';
import { OAuth } from 'oauth';
import { saveTwitterCodeVerifier } from './redis';

type TwitterUserPublicMetrics = {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
};

type TwitterUserResponse = {
  id: string;
  name: string;
  username: string;
  public_metrics: TwitterUserPublicMetrics;
};

type TwitterOAuthTokens = {
  oauthToken: string;
  oauthTokenSecret: string;
  userId?: string;
  screenName?: string;
};

/**
 * Twitter APIのベースURL
 */
export const TWITTER_API_BASE_URL = 'https://api.twitter.com/2';
export const TWITTER_OAUTH_REQUEST_TOKEN_URL = 'https://api.twitter.com/oauth/request_token';
export const TWITTER_OAUTH_ACCESS_TOKEN_URL = 'https://api.twitter.com/oauth/access_token';
export const TWITTER_OAUTH_AUTHORIZE_URL = 'https://twitter.com/oauth/authorize';

// OAuth 2.0のエンドポイント
export const TWITTER_OAUTH2_AUTHORIZE_URL = 'https://twitter.com/i/oauth2/authorize';
export const TWITTER_OAUTH2_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

/**
 * Twitter OAuth クライアントを作成
 */
function createTwitterOAuthClient() {
  const apiKey = process.env.TWITTER_API_KEY || '';
  const apiSecret = process.env.TWITTER_API_SECRET || '';
  
  if (!apiKey || !apiSecret) {
    throw new Error('Twitter API credentials are not configured');
  }
  
  return new OAuth(
    TWITTER_OAUTH_REQUEST_TOKEN_URL,
    TWITTER_OAUTH_ACCESS_TOKEN_URL,
    apiKey,
    apiSecret,
    '1.0A',
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    'HMAC-SHA1'
  );
}

/**
 * OAuth 2.0用の認証URLを生成
 */
export async function getTwitterAuthUrl(): Promise<string> {
  const clientId = process.env.TWITTER_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('Twitter Client ID is not configured');
  }

  // 環境変数の確認
  console.log("Twitter Auth URL - Environment check:");
  console.log("- CLIENT_ID:", clientId ? `${clientId.substring(0, 5)}...` : 'Missing');
  console.log("- APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

  // リダイレクトURL - 末尾のスラッシュを処理
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const redirectUri = `${normalizedBaseUrl}/api/auth/twitter/callback`;
  
  // スコープ (ユーザー情報とツイート読み取り)
  const scopes = ['users.read', 'tweet.read'].join(' ');
  
  // code_verifierを動的に生成（セキュリティ向上のため）
  const codeVerifier = generateRandomString(64);
  
  // セキュアハッシュをBase64url形式に変換
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // グローバル変数に保存する代わりにRedisに保存
  // 状態パラメータ (CSRF防止用)
  const state = generateRandomString(32);
  console.log("Code verifier set:", codeVerifier);
  console.log("Code challenge generated:", codeChallenge);
  console.log("State parameter:", state);
  
  // stateとcodeVerifierをRedisに保存（10分間有効）
  await saveTwitterCodeVerifier(state, codeVerifier);
  
  // 認証URLを構築
  const authUrl = new URL(TWITTER_OAUTH2_AUTHORIZE_URL);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  
  console.log("Authorization URL generated:", authUrl.toString());
  return authUrl.toString();
}

/**
 * ランダムな文字列を生成 (PKCE用)
 */
function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

/**
 * PKCE用のcode_challengeを生成
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Twitter OAuthのアクセストークンを取得
 * @param oauthToken OAuth認証後に返されるトークン
 * @param oauthVerifier OAuth認証後に返される検証子
 * @returns アクセストークン情報
 */
export async function getTwitterAccessToken(
  oauthToken: string,
  oauthVerifier: string
): Promise<TwitterOAuthTokens> {
  return new Promise((resolve, reject) => {
    try {
      const oauth = createTwitterOAuthClient();
      
      oauth.getOAuthAccessToken(
        oauthToken,
        '',
        oauthVerifier,
        (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
          if (error) {
            console.error('Error getting OAuth access token:', error);
            reject(error);
            return;
          }
          
          resolve({
            oauthToken: oauthAccessToken,
            oauthTokenSecret: oauthAccessTokenSecret,
            userId: results.user_id,
            screenName: results.screen_name
          });
        }
      );
    } catch (error) {
      console.error('Error getting Twitter access token:', error);
      reject(error);
    }
  });
}

/**
 * Twitter APIからユーザー情報を取得 (OAuth認証トークン使用)
 * @param oauthToken アクセストークン
 * @param oauthTokenSecret アクセストークンシークレット
 * @returns ユーザー情報とフォロワー数
 */
export async function getTwitterUserByOAuth(
  oauthToken: string,
  oauthTokenSecret: string,
  userId: string
): Promise<{
  username: string;
  followersCount: number;
} | null> {
  return new Promise((resolve, reject) => {
    try {
      const oauth = createTwitterOAuthClient();
      
      oauth.get(
        `${TWITTER_API_BASE_URL}/users/${userId}?user.fields=public_metrics`,
        oauthToken,
        oauthTokenSecret,
        (error, data) => {
          if (error) {
            console.error('Error fetching Twitter user data with OAuth:', error);
            reject(error);
            return;
          }
          
          try {
            const userData = JSON.parse(data as string).data as TwitterUserResponse;
            
            if (!userData) {
              console.error('Twitter user not found');
              resolve(null);
              return;
            }
            
            resolve({
              username: userData.username,
              followersCount: userData.public_metrics.followers_count,
            });
          } catch (parseError) {
            console.error('Error parsing Twitter API response:', parseError);
            reject(parseError);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching Twitter user with OAuth:', error);
      reject(error);
    }
  });
}

/**
 * Twitter APIからユーザー情報を取得 (Bearerトークン使用)
 * @param username Twitterのユーザー名
 * @returns ユーザー情報とフォロワー数
 */
export async function getTwitterUserByUsername(username: string): Promise<{
  username: string;
  followersCount: number;
} | null> {
  try {
    // 環境変数からTwitter APIのBearerトークンを取得
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      console.error('Twitter API bearer token is not set');
      return null;
    }

    // ユーザー名先頭の@を削除
    const cleanUsername = username.startsWith('@') 
      ? username.substring(1) 
      : username;

    // Twitter APIを呼び出してユーザー情報を取得
    const response = await axios.get(
      `${TWITTER_API_BASE_URL}/users/by/username/${cleanUsername}`, 
      {
        params: {
          'user.fields': 'public_metrics',
        },
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    // APIからのレスポンスを処理
    const userData = response.data.data as TwitterUserResponse;
    
    if (!userData) {
      console.error('Twitter user not found');
      return null;
    }

    // ユーザー名とフォロワー数を返す
    return {
      username: userData.username,
      followersCount: userData.public_metrics.followers_count,
    };
  } catch (error) {
    console.error('Error fetching Twitter user data:', error);
    return null;
  }
} 