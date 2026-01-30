import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const settingsSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Email", value: "user@example.com", action: "Change" },
      { label: "Password", value: "••••••••", action: "Update" },
      { label: "Two-Factor Authentication", value: "Enabled", action: "Manage" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Email Notifications", value: "Enabled", action: "Configure" },
      { label: "Portfolio Alerts", value: "Daily", action: "Change" },
      { label: "Deal Reminders", value: "Enabled", action: "Manage" },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    items: [
      { label: "Profile Visibility", value: "Private", action: "Change" },
      { label: "Data Export", value: "", action: "Export" },
      { label: "Connected Apps", value: "2 apps", action: "Manage" },
    ],
  },
];

export default function Settings() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        </div>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="w-5 h-5 text-muted-foreground" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.label}</p>
                    {item.value && (
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    {item.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Subscription */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5 text-accent" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Pro Plan</p>
              <p className="text-sm text-muted-foreground">$29/month • Next billing: Jan 15, 2025</p>
            </div>
            <Button variant="outline" size="sm">
              Manage Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            View Documentation
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button 
        variant="outline" 
        className="w-full text-destructive hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
