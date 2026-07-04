import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Lock, Upload, Image as ImageIcon, Loader2, LogOut, LayoutTemplate, Save } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ASSET_CATEGORIES = {
  Logos: ["campus365-logo.png"],
  Icons: ["whatsapp.png", "web.png", "pin.png"],
  Partners: [
    "skoder.png",
    "ibm.png",
    "ms-startups.png",
    "google-startups.png",
    "idea.png",
    "accelerating-bangladesh.png",
  ],
};

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isAdmin") === "true";
    }
    return false;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [activeTab, setActiveTab] = useState<"applications" | "assets" | "landing">("applications");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin@campus365" && password === "PassAd") {
      setIsAuthenticated(true);
      setLoginError("");
      if (typeof window !== "undefined") {
        localStorage.setItem("isAdmin", "true");
      }
      fetchApplications();
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setApplications(data);
    }
    setIsLoadingApps(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Enter credentials to manage assets.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your pad templates and incoming applications.</p>
          </div>
          <Button variant="outline" onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("isAdmin");
            }
            setIsAuthenticated(false);
          }}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <nav className="flex items-center gap-2 border-b pb-4">
          <Button 
            variant={activeTab === "applications" ? "default" : "ghost"}
            onClick={() => setActiveTab("applications")}
          >
            Submitted Applications
          </Button>
          <Button 
            variant={activeTab === "assets" ? "default" : "ghost"}
            onClick={() => setActiveTab("assets")}
          >
            Asset Management
          </Button>
          <Button 
            variant={activeTab === "landing" ? "default" : "ghost"}
            onClick={() => setActiveTab("landing")}
          >
            Landing Page Settings
          </Button>
        </nav>

        {activeTab === "landing" && (
          <div className="pt-4">
             <LandingSettingsCard />
          </div>
        )}

        {activeTab === "assets" && (
          <div className="space-y-10 pt-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Asset Management</h2>
              <p className="text-muted-foreground mb-6">Upload custom logos and icons for the pad template.</p>
            </div>
            
            {Object.entries(ASSET_CATEGORIES).map(([category, keys]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">{category}</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {keys.map((key) => (
                    <UploaderCard key={key} logoKey={key} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="pt-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Submitted Applications</h2>
                <p className="text-muted-foreground">Review incoming internship applications.</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchApplications}>
                Refresh
              </Button>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Applicant</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Phone Number</th>
                      <th className="p-4 font-medium">Institution</th>
                      <th className="p-4 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoadingApps ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          Loading applications...
                        </td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No applications found.
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-muted/30">
                          <td className="p-4 text-muted-foreground whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-medium">{app.name}</td>
                          <td className="p-4 text-muted-foreground">{app.email}</td>
                          <td className="p-4 text-muted-foreground">{app.phone}</td>
                          <td className="p-4">{app.institution}</td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                window.location.href = `/appointment-letter?name=${encodeURIComponent(app.name)}&institution=${encodeURIComponent(app.institution)}`;
                              }}
                            >
                              Generate Letter
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                window.location.href = `/nda?name=${encodeURIComponent(app.name)}&institution=${encodeURIComponent(app.institution)}`;
                              }}
                            >
                              Generate NDA
                            </Button>
                          </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploaderCard({ logoKey }: { logoKey: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing preview if available
  useState(() => {
    const { data } = supabase.storage.from("logos").getPublicUrl(logoKey);
    // Note: getPublicUrl always returns a URL even if the file doesn't exist yet,
    // so it might show a broken image initially if no custom logo was uploaded.
    // We'll append a timestamp query param to bust cache later.
    setPreviewUrl(data.publicUrl);
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Upsert the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("logos")
        .upload(logoKey, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Bust cache to show the new image immediately
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(logoKey);
      setPreviewUrl(`${urlData.publicUrl}?t=${Date.now()}`);
      setSuccessMessage("Uploaded successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">{logoKey}</h3>
      </div>

      <div className="mb-4 flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-2 text-center relative overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt={logoKey} className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground">No image</span>
        )}
      </div>

      <div className="mt-auto">
        <Label
          htmlFor={`upload-${logoKey}`}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${
            isUploading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isUploading ? "Uploading..." : "Replace Image"}
        </Label>
        <Input
          id={`upload-${logoKey}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {successMessage && <p className="mt-2 text-xs text-green-500">{successMessage}</p>}
      </div>
    </div>
  );
}

function LandingSettingsCard() {
  const [config, setConfig] = useState({
    badgeText: "Accepting Applications — Batch 2025",
    headingPart1: "Grow Your Career",
    headingPart2: "with Campus365",
    subtitleWords: "Fast-Track your Career, Real-world Projects, Remote Internship, Future-Proof Skills",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage.from("logos").download("landing-config.json").then(({ data }) => {
      if (data) {
        data.text().then(text => {
          try {
            setConfig(JSON.parse(text));
          } catch(e) {}
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: uploadError } = await supabase.storage.from("logos").upload(
        "landing-config.json", 
        new Blob([JSON.stringify(config)], { type: "application/json" }),
        { upsert: true, cacheControl: "0" }
      );
      if (uploadError) throw uploadError;
      setSuccess("Configuration saved! Changes are live immediately.");
      setTimeout(() => setSuccess(null), 3000);
    } catch(err: any) {
      setError(err.message || "Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm max-w-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2"><LayoutTemplate className="w-5 h-5" /> Landing Page Settings</h3>
        <p className="text-sm text-muted-foreground">Configure the text that appears on the main landing page.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Badge Text (Top)</Label>
          <Input value={config.badgeText} onChange={e => setConfig({...config, badgeText: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Heading (Part 1 - White Text)</Label>
          <Input value={config.headingPart1} onChange={e => setConfig({...config, headingPart1: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Heading (Part 2 - Gradient Highlight)</Label>
          <Input value={config.headingPart2} onChange={e => setConfig({...config, headingPart2: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Animated Subtitle Words (Comma separated)</Label>
          <Input value={config.subtitleWords} onChange={e => setConfig({...config, subtitleWords: e.target.value})} className="mt-1" />
          <p className="text-xs text-muted-foreground mt-1">These words will cycle on the screen automatically.</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}

        <Button onClick={handleSave} disabled={isSaving} className="mt-4">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
