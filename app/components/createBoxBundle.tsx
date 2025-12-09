"use client";

import { Card, Button, Typography, Alert } from "antd";
import { ArrowRight } from "lucide-react";

const { Title, Text, Paragraph } = Typography;

export function CreateBoxBundle({
  returnToStart,
}: {
  returnToStart: () => void;
}) {
  return (
    <Card
      variant="outlined"
      className="shadow-sm"
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="p-6">
        <Title level={4}>Create a Mystery Bundle</Title>
      </div>
      <div className="border-t">
        <div className="p-6 space-y-6">
          <Alert
            description="This feature is coming soon! Stay tuned for updates."
            type="info"
            showIcon
          />
          <Button type="primary" onClick={returnToStart} icon={<ArrowRight />}>
            Return to Start
          </Button>
        </div>
      </div>
    </Card>
  );
}
