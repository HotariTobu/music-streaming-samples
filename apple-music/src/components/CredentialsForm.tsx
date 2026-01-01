import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const credentialsSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  keyId: z.string().min(1, "Key ID is required"),
  privateKey: z.string().min(1, "Private Key is required"),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

export function CredentialsForm() {
  const queryClient = useQueryClient()
  const { mutate, error } = useMutation({
    mutationFn: async (data: CredentialsFormData) => {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.error || "Failed to save credentials");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        "queryKey": ["/api/credentials"]
      })
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Credentials</CardTitle>
        <CardDescription>
          Enter your Apple Developer credentials to access the Apple Music API.
          Credentials are stored in-memory only.
        </CardDescription>
      </CardHeader>
      <CardContent>
      <form onSubmit={handleSubmit(data => mutate(data))} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="teamId">Team ID</Label>
          <Input
            id="teamId"
            placeholder="XXXXXXXXXX"
            autoComplete="on"
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
            autoComplete="on"
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

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
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
      </CardContent>
    </Card>
  );
}
