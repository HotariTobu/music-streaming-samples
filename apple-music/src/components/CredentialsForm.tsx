import { Button } from "@/components/ui/button";
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
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Developer Credentials</h2>
        <p className="text-sm text-muted-foreground">
          Enter your Apple Developer credentials to access the Apple Music API.
          Credentials are stored in-memory only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="teamId">Team ID</Label>
          <Input
            id="teamId"
            name="teamId"
            placeholder="XXXXXXXXXX"
            required
          />
          <p className="text-xs text-muted-foreground">
            Found in Apple Developer account settings
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="keyId">Key ID</Label>
          <Input
            id="keyId"
            name="keyId"
            placeholder="XXXXXXXXXX"
            required
          />
          <p className="text-xs text-muted-foreground">
            10-character key identifier from MusicKit key
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="privateKey">Private Key (.p8 contents)</Label>
          <Textarea
            id="privateKey"
            name="privateKey"
            placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
            className="font-mono text-xs min-h-[140px]"
            required
          />
          <p className="text-xs text-muted-foreground">
            Paste the entire contents of your .p8 file
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        >
          {loading ? (
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
          Need a MusicKit key?{" "}
          <a
            href="https://developer.apple.com/account/resources/authkeys/list"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            Create one in Apple Developer
          </a>
        </p>
      </div>
    </div>
  );
}
