import React, { createRef, RefObject, useState } from "react";
import { Carousel } from "antd";
import { CreateBoxPrompt } from "./createBoxPrompt";
import type { RadioChangeEvent } from "antd";
import { CarouselRef } from "antd/es/carousel";
import { CreateBoxSingleItem } from "./createBoxSingleItem";
import { CreateBoxBundle } from "./createBoxBundle";

type MysteryBoxType = "bundle" | "single" | undefined;

export function CreateBoxCarousel() {
  const [selectedType, setSelectedType] = useState<MysteryBoxType>(undefined);

  const handleChange = (e: RadioChangeEvent) => {
    setSelectedType(e.target.value);
  };

  const carouselRef = createRef<CarouselRef>();

  function carouselChangePage() {
    carouselRef.current?.next();
  }

  function returnToStart() {
    carouselRef.current?.goTo(0);
  }

  const formComponent =
    selectedType === "single" ? (
      <CreateBoxSingleItem returnToStart={returnToStart} />
    ) : selectedType === "bundle" ? (
      <CreateBoxBundle returnToStart={returnToStart} />
    ) : null;

  return (
    <Carousel dots={false} infinite={false} ref={carouselRef}>
      <div>
        <h3>
          <CreateBoxPrompt
            carouselChangePage={carouselChangePage}
            handleChange={handleChange}
            selectedType={selectedType}
          />
        </h3>
      </div>
      <div>{formComponent}</div>
      <div>
        <h3>3</h3>
      </div>
      <div>
        <h3>4</h3>
      </div>
    </Carousel>
  );
}
