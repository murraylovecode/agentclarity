import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp } from "lucide-react";

const NotLoggedIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.warn(
      "Auth guard: unauthenticated access attempt to:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-foreground">
            You're not logged in
          </h1>

          {/* Joke */}
          <p className="text-muted-foreground">
            Good news: since we don't know who you are, your net worth is
            technically{" "}
            <span className="font-medium text-foreground">
              infinite 💸
            </span>
          </p>

          {/* Exponential net worth chart */}
          <div className="flex justify-center">
            <div className="rounded-lg bg-muted p-3">
              <svg
                width="160"
                height="80"
                viewBox="0 0 160 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
              >
                {/* baseline */}
                <line
                  x1="10"
                  y1="70"
                  x2="150"
                  y2="70"
                  className="stroke-muted-foreground/30"
                  strokeWidth="1"
                />

                {/* exponential curve */}
                <path
                  d="M10 68 C 40 68, 60 60, 80 45 C 100 30, 120 15, 150 5"
                  className="stroke-primary"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* end dot */}
                <circle
                  cx="150"
                  cy="5"
                  r="4"
                  className="fill-primary"
                />
              </svg>

              <p className="mt-2 text-xs text-muted-foreground text-center">
                Net worth over time
              </p>
            </div>
          </div>


          {/* Visual gag */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>
              Assets: ∞ &nbsp;•&nbsp; Liabilities: 0 &nbsp;•&nbsp; Reality:
              questionable
            </span>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/login", { replace: true })}
              className="w-full"
            >
              Log in to see your *actual* money
            </Button>
          </div>

          {/* Subtext */}
          <p className="text-xs text-muted-foreground">
            We promise it's still pretty impressive.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotLoggedIn;
