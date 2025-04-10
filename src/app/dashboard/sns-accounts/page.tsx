import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SNSAccountsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SNS Account Connection</h1>
        <p className="text-muted-foreground mt-2">
          Connect your SNS accounts to verify your follower count
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card id="x-twitter">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter) Connection
            </CardTitle>
            <CardDescription>
              Connect your X (formerly Twitter) account to verify your follower count.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/connect/twitter" method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-username">X (Twitter) Username</Label>
                <div className="flex">
                  <span className="flex items-center justify-center px-3 border border-r-0 border-input bg-muted rounded-l-md text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="twitter-username"
                    name="username"
                    placeholder="username"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Authenticate with X (Twitter)
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card id="youtube">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube Connection
            </CardTitle>
            <CardDescription>
              Connect your YouTube channel to verify your subscriber count.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/connect/youtube" method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-channel">YouTube Channel ID</Label>
                <Input
                  id="youtube-channel"
                  name="channelId"
                  placeholder="UCxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  You can find your Channel ID in &quot;Channel Settings&quot; &gt; &quot;Details&quot;.
                </p>
              </div>
              <Button type="submit" variant="destructive" className="w-full sm:w-auto">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Authenticate with YouTube
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Your currently connected SNS accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </div>
              {user?.username ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    @{user.username}
                  </Badge>
                  <Badge>Connected</Badge>
                </div>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </div>
              <Badge variant="outline">Not Connected</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 