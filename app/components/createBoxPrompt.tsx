"use client";

import { Card, Radio, Button, Typography, Space, Alert } from "antd";
import type { RadioChangeEvent } from "antd";
import { ArrowRight, Gift, Package, Shuffle } from "lucide-react";

const { Title, Text, Paragraph } = Typography;

type MysteryBoxType = "bundle" | "single" | undefined;

export function CreateBoxPrompt({
  carouselChangePage,
  handleChange,
  selectedType,
}: {
  carouselChangePage: () => void;
  handleChange: (e: RadioChangeEvent) => void;
  selectedType: MysteryBoxType;
}) {
  return (
    <Card
      variant="outlined"
      className="shadow-sm"
      styles={{
        body: { padding: 0 },
      }}
    >
      <Alert
        title={
          <Space align="center" size="middle">
            <Gift style={{ fontSize: "24px", color: "white" }} />
            <div>
              <Title level={4} style={{ margin: 0, color: "white" }}>
                Create a Mystery Box
              </Title>
              <Text
                style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "14px" }}
              >
                Surprise your customers with curated or random products
              </Text>
            </div>
          </Space>
        }
        type="success"
        style={{
          background: "linear-gradient(to right, #007F5F, #014E41)",
          border: "none",
          borderRadius: "8px 8px 0 0",
          padding: "16px 24px",
        }}
      />

      <div style={{ padding: "24px" }}>
        <Paragraph type="secondary" style={{ marginBottom: "20px" }}>
          Choose how you'd like to set up your mystery box:
        </Paragraph>

        <Radio.Group
          onChange={handleChange}
          value={selectedType}
          style={{ width: "100%", marginBottom: "24px" }}
        >
          <Space
            orientation="vertical"
            size="middle"
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Bundle Option */}
            <Radio.Button
              value="bundle"
              style={{
                height: "auto",
                padding: 0,
                border: "2px solid",
                borderColor: selectedType === "bundle" ? "#014E41" : "#d9d9d9",
                borderRadius: "8px",
                background: selectedType === "bundle" ? "#F0FDF9" : "white",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "20px", position: "relative" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#fff7e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Package style={{ fontSize: "24px", color: "#faad14" }} />
                </div>
                <Title level={5} style={{ marginBottom: "4px" }}>
                  Mystery Bundle
                </Title>
                <Paragraph
                  type="secondary"
                  style={{ fontSize: "14px", marginBottom: "12px" }}
                >
                  Curate a bundle of mystery items. Customers receive multiple
                  surprise products in one box.
                </Paragraph>
                {/*<Space size={[0, 8]} wrap>
                  <Tag color="default">3-5 items</Tag>
                </Space>*/}
              </div>
            </Radio.Button>

            {/* Single Item Option */}
            <Radio.Button
              value="single"
              style={{
                height: "auto",
                padding: 0,
                border: "2px solid",
                borderColor: selectedType === "single" ? "#014E41" : "#d9d9d9",
                borderRadius: "8px",
                background: selectedType === "single" ? "#F0FDF9" : "white",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "20px", position: "relative" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#f6ffed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Shuffle style={{ fontSize: "24px", color: "#52c41a" }} />
                </div>
                <Title level={5} style={{ marginBottom: "4px" }}>
                  Random Single Item
                </Title>
                <Paragraph
                  type="secondary"
                  style={{ fontSize: "14px", marginBottom: "12px" }}
                >
                  One randomly selected item from your inventory. Perfect for
                  affordable mystery options.
                </Paragraph>
                {/*<Space size={[0, 8]} wrap>
                  <Tag color="default">1 item</Tag>
                </Space>*/}
              </div>
            </Radio.Button>
          </Space>
        </Radio.Group>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="primary"
            size="large"
            disabled={!selectedType}
            icon={<ArrowRight />}
            iconPlacement="end"
            onClick={() => {
              carouselChangePage();
            }}
            style={{
              background: selectedType ? "#008060" : undefined,
              borderColor: selectedType ? "#07774e" : undefined,
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );
}
