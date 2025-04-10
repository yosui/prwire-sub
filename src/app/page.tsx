import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b w-full">
        <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between px-4 md:px-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">PRWIRE</h1>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    <span className="block">PR Wire</span>
                    <span className="block text-primary">Verified Subscribers</span>
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Connect your SNS accounts to verify follower count. Receive PR Wire's distribution information via RSS.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {!userId ? (
                    <>
                      <Button asChild size="lg">
                        <Link href="/sign-up">Register Now</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="lg">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-center text-xl md:text-2xl text-primary">
                      PR Wire Subscriber
                    </CardTitle>
                    <CardDescription className="text-center text-sm md:text-base">
                      Efficiently receive corporate press releases and verify your SNS account influence
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          X (Twitter)
                        </Badge>
                        <span className="text-sm text-muted-foreground">Connection and Verification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          YouTube
                        </Badge>
                        <span className="text-sm text-muted-foreground">Channel Connection and Verification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          RSS Feed
                        </Badge>
                        <span className="text-sm text-muted-foreground">Customizable</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Access corporate press releases immediately after registration. Connect your SNS accounts to utilize more features.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-screen-xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Main features provided by PR Wire Subscriber
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>SNS Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Connect your X (Twitter) and YouTube accounts to verify your follower count.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Influence Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Visualize the overall influence of your SNS accounts.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>RSS Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Receive only the information you need with customizable RSS feeds.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/10 w-full mt-auto">
        <div className="container mx-auto max-w-screen-xl flex flex-col items-center justify-between gap-4 py-10 px-4 md:flex-row md:py-6 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2024 PRWIRE. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07a4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
