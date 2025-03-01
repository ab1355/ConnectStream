import { EmailDigestSettings } from "@/components/features/settings/email-digest-settings";

export default function EmailSettingsPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Email Preferences</h1>
      <EmailDigestSettings />
    </div>
  );
}
