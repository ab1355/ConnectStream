import { ThemeSettings } from "@/components/features/settings/theme-settings";

export default function ThemeSettingsPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Theme Preferences</h1>
      <ThemeSettings />
    </div>
  );
}
