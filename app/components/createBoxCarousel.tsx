import React, { createRef, RefObject } from "react";
import { Carousel } from "antd";
import { CreateBoxPrompt } from "./createBoxPrompt";
import { CarouselRef } from "antd/es/carousel";

export function CreateBoxCarousel() {
  const carouselRef = createRef<CarouselRef>();

  function carouselChangePage() {
    carouselRef.current?.next();
  }

  return (
    <Carousel dots={false} infinite={false} ref={carouselRef}>
      <div>
        <h3>
          <CreateBoxPrompt carouselChangePage={carouselChangePage} />
        </h3>
      </div>
      <div>
        <h3>2</h3>
      </div>
      <div>
        <h3>3</h3>
      </div>
      <div>
        <h3>4</h3>
      </div>
    </Carousel>
  );
}
