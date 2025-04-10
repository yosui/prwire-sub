import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getUserFromRedis } from '@/lib/redis';

/**
 * GET: 現在の認証ユーザーの情報とRedisデータを取得
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

    // Clerkからユーザー情報を取得
    const user = await currentUser();
    
    // Redisからユーザーデータを取得
    const redisUserData = await getUserFromRedis(userId);

    // ユーザー情報とRedisデータを返す
    return NextResponse.json({
      userId,
      user: {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        username: user?.username,
        email: user?.emailAddresses[0]?.emailAddress,
        createdAt: user?.createdAt,
      },
      redisData: redisUserData,
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 