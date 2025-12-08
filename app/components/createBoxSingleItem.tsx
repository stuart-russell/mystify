"use client";

import { useState } from "react";
import { Card, Radio, Button, Typography, Tag, Space, Alert } from "antd";
import type { RadioChangeEvent } from "antd";
import { ArrowRight, Gift, Package, Shuffle } from "lucide-react";
import { CarouselRef } from "antd/es/carousel";

const { Title, Text, Paragraph } = Typography;

type MysteryBoxType = "bundle" | "single" | undefined;

export function CreateBoxSingleItem({
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
        <Title level={4}>Create a Mystery Item</Title>
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
