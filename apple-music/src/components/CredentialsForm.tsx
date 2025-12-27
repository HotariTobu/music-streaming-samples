import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, type FormEvent } from "react";

interface CredentialsFormProps {
  onConfigured: () => void;
}

export function CredentialsForm({ onConfigured }: CredentialsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const credentials = {
      teamId: formData.get("teamId") as string,
      keyId: formData.get("keyId") as string,
      privateKey: formData.get("privateKey") as string,
    };

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save credentials");
      }

      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Apple Music Configuration</CardTitle>
        <CardDescription>
          Enter your Apple Developer credentials to access the Apple Music API.
          Credentials are stored in-memory only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="teamId">Team ID</Label>
            <Input
              id="teamId"
              name="teamId"
              placeholder="XXXXXXXXXX"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="keyId">Key ID</Label>
            <Input
              id="keyId"
              name="keyId"
              placeholder="XXXXXXXXXX"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="privateKey">Private Key (.p8 contents)</Label>
            <Textarea
              id="privateKey"
              name="privateKey"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              className="font-mono text-xs min-h-[120px]"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Configuring..." : "Configure"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
