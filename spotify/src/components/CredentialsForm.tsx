import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const credentialsSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

interface CredentialsFormProps {
  onConfigured: () => void;
}

export function CredentialsForm({ onConfigured }: CredentialsFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
  });

  const onSubmit = async (data: CredentialsFormData) => {
    setSubmitError(null);

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || "Failed to save credentials");
      }

      onConfigured();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spotify Developer Credentials</CardTitle>
        <CardDescription>
          Enter your Spotify app credentials to access the Spotify API.
          Credentials are stored in-memory only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              autoComplete="on"
              {...register("clientId")}
            />
            {errors.clientId && (
              <p className="text-xs text-destructive">{errors.clientId.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Found in your Spotify Developer Dashboard app settings
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
              {...register("clientSecret")}
            />
            {errors.clientSecret && (
              <p className="text-xs text-destructive">{errors.clientSecret.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Keep this secret! Never expose it in client-side code
            </p>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Important:</strong> Make sure to add{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                http://127.0.0.1:22222/callback
              </code>{" "}
              as a Redirect URI in your Spotify app settings.
            </AlertDescription>
          </Alert>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Configuring...
              </span>
            ) : (
              "Configure"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Need a Spotify app?{" "}
            <a
              href="https://developer.spotify.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              Create one in Spotify Developer Dashboard
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
