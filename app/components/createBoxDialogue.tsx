import { TBoxType } from "app/lib/api/mysify/schema";
import { useState } from "react";
import { Typography, Row, Col, Card } from "antd";
import { Box, Gift, Package, Shuffle, Sparkles } from "lucide-react";

export function CreateMysteryBoxDialogue() {
  const [selectedType, setSelectedType] = useState<TBoxType | null>(null);

  const { Title, Paragraph, Text, Link } = Typography;

  return (
    <s-section>
      <Title level={4}>Select Box Type</Title>
      <Row>
        <Col span={11}>
          <Card style={{ width: 305 }}>
            <div>
              <Package />
            </div>
            <h3>Mystery Bundle</h3>
            <p>
              Curate a bundle of mystery items. Customers receive multiple
              surprise products in one box.
            </p>
            <div>
              <span>
                <Box />
                3-5 items
              </span>
              <span>
                <Sparkles />
                Higher value
              </span>
            </div>
          </Card>
        </Col>
        <Col span={11}>
          <Card style={{ width: 305 }}>
            <div>
              <Shuffle />
            </div>
            <h3>Random Single Item</h3>
            <p>
              One randomly selected item from your inventory. Perfect for
              affordable mystery options.
            </p>
            <div>
              <span>
                <Gift />1 item
              </span>
              <span>
                <Sparkles />
                Quick setup
              </span>
            </div>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={11}></Col>
        <Col span={11} style={{ textAlign: "right", marginTop: 16 }}>
          <s-button type="submit" disabled={!selectedType}>
            Continue
          </s-button>
        </Col>
      </Row>
    </s-section>
  );
}
