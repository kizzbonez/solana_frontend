"use client";
import Slider from "react-slick";
import { FluentChevronLeft, FluentChevronRight } from "@/app/components/icons/lib";
import { useBreakpointValue } from "@/app/hooks/useBreakPointValue";


function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute z-[1] right-[0px] top-1/2 -translate-y-1/2 group">
      <div className="rounded-full shadow-md overflow-hidden group-hover:shadow-lg group-hover:border-2 group-hover:border-neutral-300">
        <div className="bg-white text-neutral-600 opacity-70 group-hover:opacity-100 cursor-pointer">
          <FluentChevronRight />
        </div>
      </div>
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute z-[1] left-[0px] top-1/2 -translate-y-1/2 group">
      <div className="rounded-full shadow-md overflow-hidden group-hover:shadow-lg group-hover:border-2 group-hover:border-neutral-300">
        <div className="bg-white text-neutral-600 opacity-70 group-hover:opacity-100 cursor-pointer">
          <FluentChevronLeft />
        </div>
      </div>
    </div>
  );
}

export default function CollectionCarousel({
  children,
  settings = {},
  breakpoints = [],
}) {
  const breakpoint_value = useBreakpointValue(breakpoints);
  const predefined = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  let merged = { ...predefined, ...settings };
  if (breakpoints && breakpoint_value) {
    merged["slidesToShow"] = breakpoint_value;
  }
  return (
    <div className="w-full pt-[5px] pb-[25px]">
      <Slider {...merged}>
        {children}
      </Slider>
    </div>
  );
}
