import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { mailApi } from '../../../api/mail/mail.api';
import { Button } from '../../../components/ui/button1';
import { Input } from '../../../components/ui';
import { Loader } from '../../../components/ui/loader';

const MailConsolePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // SMTP Settings State
  const [host, setHost] = useState('');
  const [port, setPort] = useState<number>(587);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  // UI state
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current config
  const fetchConfig = async () => {
    try {
      const config = await mailApi.getConfig();
      setHost(config.host || '');
      setPort(config.port || 587);
      setUsername(config.username || '');
      setHasPassword(!!config.hasPassword);
      setSenderEmail(config.senderEmail || '');
    } catch (error) {
      console.error('Failed to load SMTP settings:', error);
      toast.error('Failed to load SMTP settings from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !port || !username) {
      toast.error('Please fill in SMTP Host, Port, and Username to test connection.');
      return;
    }

    setIsTesting(true);
    try {
      await mailApi.testConnection({
        host,
        port: Number(port),
        username,
        password: password || undefined,
        senderEmail: senderEmail || undefined,
      });
      toast.success('SMTP connection verified successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'SMTP connection verification failed.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !port || !username) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!hasPassword && !password) {
      toast.error('SMTP Password is required for the initial setup.');
      return;
    }

    setIsSaving(true);
    try {
      await mailApi.saveConfig({
        host,
        port: Number(port),
        username,
        password: password || undefined, // Send password only if changed
        senderEmail: senderEmail || undefined,
      });
      toast.success('SMTP configuration saved successfully!');
      setPassword(''); // Clear local password field after save
      fetchConfig();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const applyMailtrapSandboxPreset = () => {
    setHost('sandbox.smtp.mailtrap.io');
    setPort(2525);
    setUsername('');
    setPassword('');
    toast.success('Mailtrap Sandbox preset filled. Please provide your sandbox username and password.');
  };

  const applyMailtrapSendingPreset = () => {
    setHost('live.smtp.mailtrap.io');
    setPort(587);
    setUsername('api');
    setPassword('');
    toast.success('Mailtrap Sending preset filled. Please enter your Mailtrap API token as the password.');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-surface-primary border border-border-primary rounded-sm p-4 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary">SMTP Mail Configuration</h2>
        <p className="text-sm text-text-secondary">Configure global SMTP settings for password recovery and notifications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        {/* Main SMTP Form */}
        <div className="bg-surface-primary border border-border-primary rounded-sm p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-text-primary">SMTP Server Connection</h3>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="SMTP Server Host *"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                valueTransform="none"
                placeholder="smtp.gmail.com"
                required
                classes={{ container: 'max-w-none' }}
              />
              <Input
                label="SMTP Server Port *"
                type="number"
                value={String(port)}
                onChange={(e) => setPort(Number(e.target.value))}
                valueTransform="none"
                placeholder="587"
                required
                classes={{ container: 'max-w-none' }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="SMTP Username *"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                valueTransform="none"
                placeholder="user@example.com"
                required
                classes={{ container: 'max-w-none' }}
              />
              <Input
                label={hasPassword ? "SMTP Password (already saved, fill to change)" : "SMTP Password *"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                valueTransform="none"
                placeholder="SMTP server password"
                required={!hasPassword}
                classes={{ container: 'max-w-none' }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Sender Email (Fallback if not specified)"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                valueTransform="none"
                placeholder="no-reply@yourdomain.com"
                classes={{ container: 'max-w-none' }}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border-primary">
              <Button
                type="button"
                variant="outline"
                disabled={isTesting || isSaving}
                onClick={handleTestConnection}
              >
                {isTesting ? 'Verifying...' : 'Test Connection'}
              </Button>
              <Button
                type="submit"
                disabled={isTesting || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>

        {/* Quick presets & Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-primary border border-border-primary rounded-sm p-4 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-text-primary uppercase tracking-wider">Mailtrap Presets</h4>
            <p className="text-xs text-text-secondary">Quickly set up mock SMTP testing using your Mailtrap accounts.</p>
            <div className="space-y-2">
              <Button
                onClick={applyMailtrapSandboxPreset}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start"
              >
                Use Sandbox Preset
              </Button>
              <Button
                onClick={applyMailtrapSendingPreset}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start"
              >
                Use Live Sending Preset
              </Button>
            </div>
          </div>

          <div className="bg-surface-secondary/50 rounded-sm border border-border-primary/50 p-4 space-y-3">
            <h4 className="font-bold text-xs text-text-secondary uppercase tracking-wider">Quick Info</h4>
            <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
              <li>Use port <strong>465</strong> for <strong>SSL/TLS</strong>.</li>
              <li>Use port <strong>587</strong> for <strong>STARTTLS</strong>.</li>
              <li>Use port <strong>2525</strong> for Mailtrap sandbox testing.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailConsolePage;
