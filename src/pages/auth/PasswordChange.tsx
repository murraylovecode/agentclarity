import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";

export default function PasswordChange() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            const email = userData.user?.email;

            if (!email) {
                setMessage("Unable to verify user");
                setIsLoading(false);
                return;
            }

            // Reauthenticate with current password
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password: currentPassword,
            });

            if (loginError) {
                setMessage("Current password is incorrect");
                setIsLoading(false);
                return;
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                setMessage("Unexpected error occurred");
            } else {
                setMessage("Successfully updated password");
                navigate("/login");
            }
        } catch (err) {
            setMessage("Unexpected error occurred");
        }

        setIsLoading(false);
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md animate-fade-in">
                <Card className="shadow-vig-lg border-border/50">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-semibold">
                            Change Password
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your current password and choose a new one
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Current Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Current Password
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    New Password
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className="text-sm text-center text-red-500">
                                    {message}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="hero"
                                size="lg"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        Updating password...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Update Password
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}