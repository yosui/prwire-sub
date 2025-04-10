"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


type RedisUserData = {
  userId: string;
  platforms: {
    twitter?: {
      username: string;
      followersCount: number;
      verifiedAt: string;
    };
    youtube?: {
      channelId?: string;
      subscribersCount?: number;
      verifiedAt?: string;
    };
  };
  totalFollowers: number;
  verifiedBadge: boolean;
};

export default function SNSConnectionTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [redisData, setRedisData] = useState<RedisUserData | null>(null);
  
  // コンポーネントマウント時にユーザー情報を取得
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.user) {
          // Nothing to set here
        }
        if (data.redisData) {
          setRedisData(data.redisData);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }
    
    fetchUserData();
  }, []); 

  // Twitter OAuth認証を開始
  async function startTwitterOAuth() {
    try {
      setIsLoading(true);
      // OAuth認証を開始するAPIエンドポイントにリダイレクト
      window.location.href = '/api/connect/twitter?oauth=true';
    } catch (error) {
      console.error('Twitter OAuth error:', error);
      toast.error('Failed to start Twitter authentication');
      setIsLoading(false);
    }
  }
  
  // 認証から1ヶ月経過しているかチェック
  const isOneMonthPassed = (verifiedAt: string | undefined): boolean => {
    if (!verifiedAt) return true;
    
    const verifiedDate = new Date(verifiedAt);
    const currentDate = new Date();
    
    // 1ヶ月を30日（2592000000ミリ秒）として計算
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    return currentDate.getTime() - verifiedDate.getTime() >= oneMonthInMs;
  };

  // Twitter接続状態を確認
  const isTwitterConnected = !!redisData?.platforms?.twitter;
  
  // 再認証可能かどうかを判定
  const canReauthTwitter = isOneMonthPassed(redisData?.platforms?.twitter?.verifiedAt);
  
  // 前回の認証日時から次回可能になる日時を計算
  const getNextAuthDate = (verifiedAt: string | undefined): string => {
    if (!verifiedAt) return 'Available now';
    
    const verifiedDate = new Date(verifiedAt);
    // 30日後の日付を計算
    const nextAuthDate = new Date(verifiedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return nextAuthDate.toLocaleDateString('en-US');
  };
  
  // 再認証可能になる日
  const nextTwitterAuthDate = getNextAuthDate(redisData?.platforms?.twitter?.verifiedAt);

  // 再認証ボタンのテキストを取得する関数
  const getReauthButtonText = (canReauth: boolean, nextAuthDate: string): string => {
    if (canReauth) {
      return "Reconnect";
    }
    return `Available on ${nextAuthDate}`;
  };

  return (
    <>
      <h2 className="text-2xl font-bold mt-8 mb-4">Connect Your SNS Accounts</h2>
      <p className="text-muted-foreground mb-6">
        Connect your social media accounts to verify your follower count and unlock features
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card id="x-twitter">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter) Connection
              {isTwitterConnected && (
                <Badge className="ml-2 bg-green-500">Connected</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Connect your X (formerly Twitter) account to verify your follower count.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isTwitterConnected ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Account:</span> @{redisData?.platforms.twitter?.username}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Followers:</span> {redisData?.platforms.twitter?.followersCount.toLocaleString() || 0}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Verified on:</span> {new Date(redisData?.platforms.twitter?.verifiedAt || '').toLocaleString('en-US')}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            variant="outline"
                            className="mt-2 w-full sm:w-auto"
                            onClick={startTwitterOAuth}
                            disabled={isLoading || !canReauthTwitter}
                          >
                            {getReauthButtonText(canReauthTwitter, nextTwitterAuthDate)}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canReauthTwitter && (
                        <TooltipContent>
                          <p>You can reconnect one month after your verification date.<br />Next verification available after {nextTwitterAuthDate}.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <>
                  <p className="text-sm">
                    Connect your X (Twitter) account to verify your follower count.
                    You&apos;ll be redirected to X (Twitter) after clicking the button.
                  </p>
                  
                  <Button 
                    onClick={startTwitterOAuth} 
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Connect with X (Twitter)
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card id="youtube" className="opacity-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0 3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube Connection
              <Badge className="ml-2 bg-yellow-500">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>
              Connect your YouTube channel to verify your subscriber count.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                YouTube connection will be available soon. Stay tuned for updates!
              </p>
              
              <Button 
                className="w-full sm:w-auto opacity-70"
                disabled={true}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0 3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Connect with YouTube (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 