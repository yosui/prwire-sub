"use client";

import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { userId } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage application settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox id="notifications-email-updates" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="notifications-email-updates" className="font-medium">
                      New Feature Announcements
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about new features and important updates for PRWIRE.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="notifications-email-security" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="notifications-email-security" className="font-medium">
                      Security Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important notifications about your account security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RSS Settings</CardTitle>
          <CardDescription>RSS Feed Subscription Settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rss-url" className="font-medium">Your Personal RSS Feed URL</Label>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <input
                  id="rss-url"
                  type="text"
                  readOnly
                  value={`https://prwire.jp/feed?id=${userId}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://prwire.jp/feed?id=${userId}`);
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Register this URL in your favorite RSS reader to receive PRWIRE's distribution information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 