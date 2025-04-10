import { Redis } from '@upstash/redis';

// ユーザーデータの型定義
type TwitterPlatformData = {
  username: string;
  followersCount: number;
  verifiedAt: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
};

type YoutubePlatformData = {
  channelId?: string;
  subscribersCount?: number;
  verifiedAt?: string;
  accessToken?: string;
};

type PlatformsData = {
  twitter?: TwitterPlatformData;
  youtube?: YoutubePlatformData;
};

export type UserData = {
  userId: string;
  name?: string;
  email?: string;
  status?: string;
  verificationDate?: string;
  lastUpdated: string;
  platforms: PlatformsData;
  totalFollowers: number;
  verifiedBadge: boolean;
  joinDate: string;
};

// Upstash Redis クライアントのシングルトンインスタンス
let redisClient: Redis | null = null;

// Redisクライアントを取得または初期化する関数
export function getRedisClient() {
  if (!redisClient) {
    // Upstashの環境変数を使用して初期化
    // これらの環境変数はVercelのプロジェクト設定で自動的に設定されます
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
  }

  return redisClient;
}

// Redisからユーザー情報を取得
export async function getUserFromRedis(userId: string): Promise<UserData | null> {
  const client = getRedisClient();
  
  try {
    // Upstash Redisでは、自動的にJSONとして取得できる
    const userData = await client.get<UserData>(`subscriber:${userId}`);
    
    if (!userData) {
      return null;
    }
    
    // 文字列かオブジェクトかをチェックして適切に処理
    if (typeof userData === 'string') {
      try {
        return JSON.parse(userData) as UserData;
      } catch (parseError) {
        console.error('Error parsing Redis data:', parseError);
        return null;
      }
    }
    
    // 既にオブジェクトの場合はそのまま返す
    return userData as UserData;
  } catch (error) {
    console.error('Error fetching user data from Redis:', error);
    return null;
  }
}

// ユーザー情報をRedisに保存
export async function saveUserToRedis(userId: string, userData: UserData): Promise<UserData> {
  const client = getRedisClient();
  
  try {
    await client.set(`subscriber:${userId}`, userData);
    return userData;
  } catch (error) {
    console.error('Error saving user data to Redis:', error);
    throw error;
  }
}

// Twitter情報をユーザーデータに保存
export async function saveTwitterInfo(
  userId: string, 
  username: string, 
  followersCount: number
): Promise<UserData> {
  // 既存のユーザーデータを取得
  let userData = await getUserFromRedis(userId);
  
  if (!userData) {
    // ユーザーデータが存在しない場合は新規作成
    userData = {
      userId,
      platforms: {},
      totalFollowers: 0,
      verifiedBadge: false,
      joinDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  // TwitterのプラットフォームデータがなければObject作成
  if (!userData.platforms) {
    userData.platforms = {};
  }
  
  // Twitter情報を更新
  userData.platforms.twitter = {
    username,
    followersCount,
    verifiedAt: new Date().toISOString(),
  };
  
  // 合計フォロワー数を更新
  // YouTubeのフォロワー数があれば加算
  const youtubeFollowers = 
    userData.platforms.youtube?.subscribersCount || 0;
  
  userData.totalFollowers = followersCount + youtubeFollowers;
  userData.lastUpdated = new Date().toISOString();
  
  // 10000フォロワー以上で検証済みバッジを付与
  if (userData.totalFollowers >= 10000) {
    userData.verifiedBadge = true;
  }
  
  // 更新したデータをRedisに保存
  return saveUserToRedis(userId, userData);
} 