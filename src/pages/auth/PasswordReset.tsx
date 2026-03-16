import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";

export default function PasswordReset() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        setMessage("")
        if (password == confirmPassword) {
            const { data, error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                setMessage("Unexpected Error Occured")
            }
            else {
                setMessage("Successfully reset password")
                navigate("/login")
            }
        }
        else {
            setMessage("Passwords do not match")
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md animate-fade-in">
                <Card className="shadow-vig-lg border-border/50">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-semibold">
                            Set a new password
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* New Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-foreground"
                                >
                                    New Password
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                    <Input
                                        id="password"
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                {message}
                            </div>
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