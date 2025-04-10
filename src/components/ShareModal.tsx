"use client";

import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ShareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  followersCount: number;
};

export default function ShareModal({ 
  open, 
  onOpenChange, 
  username, 
  followersCount 
}: ShareModalProps) {
  // 乱数パラメータの生成
  const randomParam = Math.floor(Math.random() * 1000000);
  
  // baseUrlの設定
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verify.prwi.re';
  
  // OG画像のURL構築
  const ogImageUrl = new URL('/api/og', baseUrl);
  ogImageUrl.searchParams.set('username', username);
  ogImageUrl.searchParams.set('followers', followersCount.toString());
  ogImageUrl.searchParams.set('r', randomParam.toString());
  
  // シェアURLの構築
  const shareUrl = `${baseUrl}/preview/${username}-${followersCount}-${randomParam}`;
  
  // Generate share text
  const shareText = encodeURIComponent(
    `I've verified my X account @${username} with ${followersCount.toLocaleString()} followers! #PRWire #FollowerVerify`
  );
  
  // X share link
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
  
  // OG image preview load state
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your follower count on X?</DialogTitle>
          <DialogDescription>
            Share your verified follower count on X and let your friends know.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="w-full max-w-sm overflow-hidden rounded-lg border shadow-sm">
            {/* プレビュー表示 - 通常のimg要素を使用 */}
            <div className={`relative ${imageLoaded ? 'block' : 'hidden'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={ogImageUrl.toString()}
                alt={`@${username}'s verified follower count`}
                className="w-full h-auto"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            
            {/* フォールバック表示 */}
            <div className={`${imageLoaded ? 'hidden' : 'block'} p-4 bg-muted/50`}>
              <Card className="p-4 border rounded-lg">
                <div className="space-y-2 text-center">
                  <div className="flex justify-center">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">@{username}</h3>
                  <p className="text-2xl font-bold">{followersCount.toLocaleString()} followers</p>
                  <p className="text-sm text-muted-foreground">Verified by PRWire</p>
                </div>
              </Card>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            The image above will be shared
          </p>
        </div>
        
        <DialogFooter className="flex sm:justify-center gap-3 mt-4">
          <Button 
            className="flex-1 sm:flex-initial sm:min-w-32"
            onClick={() => window.open(twitterShareUrl, "_blank")}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-initial sm:min-w-32"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 