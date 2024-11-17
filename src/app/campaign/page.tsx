"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useToast } from "~/hooks/use-toast";

type Campaign = {
  id: number;
  audienceSegmentId: number;
  message: string;
  scheduledAt: string;
  sentAt: string | null;
  audienceSegment: {
    id: number;
    name: string;
    conditions: string;
  };
};

type AudienceSegment = {
  id: number;
  name: string;
};

type NewCampaign = {
  audienceSegmentId: number;
  message: string;
  scheduledAt: string;
};

export default function CampaignPage() {
  const { toast } = useToast(); 
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>(
    [],
  );
  const [newCampaign, setNewCampaign] = useState<NewCampaign>({
    audienceSegmentId: 0,
    message: "",
    scheduledAt: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAudienceSegments();
  }, []);

  const fetchCampaignsBySegment = async (segmentId: number) => {
    try {
      const response = await axios.get<{ campaigns: Campaign[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/campaign/${segmentId}`,
      );
      setCampaigns(response.data.campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to fetch campaigns. Please try again.");
    }
  };

  const fetchAudienceSegments = async () => {
    try {
      const response = await axios.get<{ segments: AudienceSegment[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/audience/all`,
      );
      setAudienceSegments(response.data.segments);
    } catch (err) {
      console.error("Error fetching audience segments:", err);
      setError("Failed to fetch audience segments. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.message.includes("[Name]")) {
      setError(
        'The message must include the placeholder "[Name]" for personalization.',
      );
      return;
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/campaign`,
        newCampaign,
      );
      void fetchCampaignsBySegment(Number(newCampaign.audienceSegmentId));
      setNewCampaign({
        audienceSegmentId: 0,
        message: "",
        scheduledAt: "",
      });
      setError(null);

      // Show success toast notification
      toast({
        title: "Success",
        description: "Campaign created successfully.",
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError("Failed to create campaign. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Campaign Management</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              value={String(newCampaign.audienceSegmentId)}
              onValueChange={(value) =>
                setNewCampaign((prev) => ({
                  ...prev,
                  audienceSegmentId: Number(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audience segment" />
              </SelectTrigger>
              <SelectContent>
                {audienceSegments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id.toString()}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Campaign message"
              value={newCampaign.message}
              onChange={(e) =>
                setNewCampaign((prev: NewCampaign) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
            <Input
              type="datetime-local"
              value={newCampaign.scheduledAt}
              onChange={(e) =>
                setNewCampaign((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
            />
            <Button type="submit" className="w-full">
              Create Campaign
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-3xl font-semibold">Past Campaigns</h2>
      <div className="space-y-4">
        {audienceSegments.map((segment) => {
          const segmentCampaigns = campaigns.filter(
            (campaign) => campaign.audienceSegmentId === segment.id,
          );

          return (
            <div key={segment.id}>
              <h3 className="text-lg font-semibold">
                {segment.name} Campaigns
              </h3>
              {segmentCampaigns.length > 0 ? (
                segmentCampaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <CardTitle>
                        Campaign for {campaign.audienceSegment.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{campaign.message}</p>
                      <div className="text-muted-foreground flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Scheduled for:{" "}
                        {new Date(campaign.scheduledAt).toLocaleString()}
                      </div>
                      {campaign.sentAt && (
                        <div className="text-muted-foreground mt-1 flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Sent at: {new Date(campaign.sentAt).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No campaigns found.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
