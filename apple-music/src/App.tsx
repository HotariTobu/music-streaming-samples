import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CredentialsForm } from "./components/CredentialsForm";
import { MusicKitProvider, useMusicKit } from "./contexts/MusicKitContext";
import "./index.css";

function MusicKitStatus() {
  const { isConfigured, isReady, isAuthorized, error, authorize, checkCredentials } = useMusicKit();

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center gap-6">
        <CredentialsForm onConfigured={checkCredentials} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isReady) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initializing MusicKit...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading MusicKit JS and configuring with your credentials.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Apple Music</CardTitle>
        <CardDescription>
          MusicKit initialized successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className={`text-sm font-medium ${isAuthorized ? "text-green-600" : "text-yellow-600"}`}>
            {isAuthorized ? "Authorized" : "Not Authorized"}
          </span>
        </div>
        {!isAuthorized && (
          <Button onClick={authorize}>
            Authorize with Apple Music
          </Button>
        )}
        {isAuthorized && (
          <p className="text-sm text-muted-foreground">
            You can now access Apple Music features.
            Search functionality coming next!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function App() {
  return (
    <MusicKitProvider>
      <div className="container mx-auto p-8 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold">Apple Music Sample</h1>
        <MusicKitStatus />
      </div>
    </MusicKitProvider>
  );
}

export default App;
