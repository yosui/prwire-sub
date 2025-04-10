import axios from 'axios';

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

/**
 * Twitter APIのベースURL
 */
const TWITTER_API_BASE_URL = 'https://api.twitter.com/2';

/**
 * Twitter APIからユーザー情報を取得
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