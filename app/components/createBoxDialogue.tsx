import { TBoxType } from "app/lib/api/mysify/schema";
import { useState } from "react";
import { Row, Col, Card } from "antd";

export function CreateMysteryBoxDialogue() {
  const [selectedType, setSelectedType] = useState<TBoxType | null>(null);

  return (
    <s-section>
      <Card title="Card title">
        <Row>
          <Col span={12}>Col</Col>
          <Col span={12}>Col</Col>
        </Row>
      </Card>
    </s-section>
  );
}
