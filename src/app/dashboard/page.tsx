import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserFromRedis } from "@/lib/redis";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Redisからユーザーデータを取得
  const redisUserData = await getUserFromRedis(userId || '');
  
  // フォロワーデータの設定（Redisデータがなければモックデータを使用）
  const totalFollowers = redisUserData?.totalFollowers || 0;
  const verifiedBadge = redisUserData?.verifiedBadge || false;
  
  // プラットフォーム情報
  const connectedPlatforms = [
    {
      name: "X (Twitter)",
      username: redisUserData?.platforms.twitter?.username || user?.username || "Not Connected",
      followersCount: redisUserData?.platforms.twitter?.followersCount || 0,
      connected: !!redisUserData?.platforms.twitter || !!user?.username,
      verifiedAt: redisUserData?.platforms.twitter?.verifiedAt || user?.createdAt || null
    },
    {
      name: "YouTube",
      username: redisUserData?.platforms.youtube?.channelId || "Not Connected",
      subscribersCount: redisUserData?.platforms.youtube?.subscribersCount || 0,
      connected: !!redisUserData?.platforms.youtube?.channelId,
      verifiedAt: redisUserData?.platforms.youtube?.verifiedAt || null
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            View your account information and connected SNS overview.
          </p>
        </div>
        {verifiedBadge && (
          <Badge className="w-fit">Verified</Badge>
        )}
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>The influence of your SNS accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Followers</h3>
              <p className="text-3xl font-bold">{totalFollowers.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">X (Twitter)</h3>
              <p className="text-3xl font-bold">{(connectedPlatforms[0].followersCount ?? 0).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">YouTube</h3>
              <p className="text-3xl font-bold">{(connectedPlatforms[1].subscribersCount ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sns" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="sns">SNS Accounts</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p>{user?.firstName} {user?.lastName}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                  <p>{user?.emailAddresses[0]?.emailAddress || "Not Set"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p className="font-mono text-xs md:text-sm">{userId}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Registration Date</h3>
                  <p>{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/settings">
                  Edit Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected SNS Accounts</CardTitle>
              <CardDescription>Your connected SNS platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {connectedPlatforms.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <h3 className="font-medium">{platform.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{platform.username}</span>
                        {platform.connected && (
                          <span className="text-muted-foreground">
                            {platform.followersCount?.toLocaleString() || platform.subscribersCount?.toLocaleString()} followers
                          </span>
                        )}
                      </div>
                    </div>
                    {platform.connected ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Connected
                      </Badge>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/sns-accounts#${platform.name.toLowerCase().replace(/\s+/g, '')}`}>
                          Connect
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/sns-accounts">
                  Manage SNS Accounts
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 