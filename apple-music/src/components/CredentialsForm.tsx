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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Developer Credentials</h2>
        <p className="text-sm text-zinc-400">
          Enter your Apple Developer credentials to access the Apple Music API.
          Credentials are stored in-memory only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="teamId" className="text-zinc-300">
            Team ID
          </Label>
          <Input
            id="teamId"
            name="teamId"
            placeholder="XXXXXXXXXX"
            required
            className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <p className="text-xs text-zinc-500">
            Found in Apple Developer account settings
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="keyId" className="text-zinc-300">
            Key ID
          </Label>
          <Input
            id="keyId"
            name="keyId"
            placeholder="XXXXXXXXXX"
            required
            className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          <p className="text-xs text-zinc-500">
            10-character key identifier from MusicKit key
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="privateKey" className="text-zinc-300">
            Private Key (.p8 contents)
          </Label>
          <Textarea
            id="privateKey"
            name="privateKey"
            placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
            className="font-mono text-xs min-h-[140px] bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            required
          />
          <p className="text-xs text-zinc-500">
            Paste the entire contents of your .p8 file
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
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

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Need a MusicKit key?{" "}
          <a
            href="https://developer.apple.com/account/resources/authkeys/list"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300"
          >
            Create one in Apple Developer
          </a>
        </p>
      </div>
    </div>
  );
}
