import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const credentialsSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  keyId: z.string().min(1, "Key ID is required"),
  privateKey: z.string().min(1, "Private Key is required"),
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
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Developer Credentials</h2>
        <p className="text-sm text-muted-foreground">
          Enter your Apple Developer credentials to access the Apple Music API.
          Credentials are stored in-memory only.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="teamId">Team ID</Label>
          <Input
            id="teamId"
            placeholder="XXXXXXXXXX"
            {...register("teamId")}
          />
          {errors.teamId && (
            <p className="text-xs text-destructive">{errors.teamId.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Found in Apple Developer account settings
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="keyId">Key ID</Label>
          <Input
            id="keyId"
            placeholder="XXXXXXXXXX"
            {...register("keyId")}
          />
          {errors.keyId && (
            <p className="text-xs text-destructive">{errors.keyId.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            10-character key identifier from MusicKit key
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="privateKey">Private Key (.p8 contents)</Label>
          <Textarea
            id="privateKey"
            placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
            className="font-mono text-xs min-h-[140px]"
            {...register("privateKey")}
          />
          {errors.privateKey && (
            <p className="text-xs text-destructive">{errors.privateKey.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Paste the entire contents of your .p8 file
          </p>
        </div>

        {submitError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
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
