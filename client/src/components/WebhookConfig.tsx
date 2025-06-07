import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Settings, Webhook } from 'lucide-react';

export default function WebhookConfig() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const webhookUrl = `${window.location.origin}/api/webhook/jira`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Test Successful",
          description: "Webhook endpoint is working correctly",
        });
      } else {
        throw new Error('Test failed');
      }
    } catch (err) {
      toast({
        title: "Test Failed",
        description: "Webhook endpoint test failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-cyan-200 dark:border-cyan-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-cyan-400" />
          Jira Webhook Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="webhook-url"
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to your Jira project settings</li>
            <li>Navigate to System → WebHooks</li>
            <li>Click "Create a WebHook"</li>
            <li>Paste the URL above into the URL field</li>
            <li>Select events: Issue created, Issue updated, Issue deleted</li>
            <li>Save the webhook configuration</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label>Supported Events</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">issue:created</Badge>
            <Badge variant="secondary">issue:updated</Badge>
            <Badge variant="secondary">issue:deleted</Badge>
            <Badge variant="secondary">issue:assigned</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testWebhook} variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Test Webhook
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Expected Payload Format</Label>
          <Textarea
            value={`{
  "issue": {
    "key": "PROJ-123",
    "fields": {
      "summary": "Issue title",
      "description": "Issue description",
      "priority": { "name": "High" },
      "issuetype": { "name": "Bug" }
    }
  },
  "webhookEvent": "jira:issue_created"
}`}
            readOnly
            className="font-mono text-xs"
            rows={12}
          />
        </div>
      </CardContent>
    </Card>
  );
}