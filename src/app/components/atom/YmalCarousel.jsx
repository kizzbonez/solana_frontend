"use client";
import Slider from "react-slick";
import { FluentChevronLeft, FluentChevronRight } from "@/app/components/icons/lib";
import { useBreakpointValue } from "@/app/hooks/useBreakPointValue";


function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute z-[1] top-[50%] right-[0px] group">
      <div className="rounded-full shadow-md overflow-hidden group-hover:shadow-lg border-2 border-transparent group-hover:border-2 group-hover:border-neutral-300">
        <div className="bg-white text-neutral-600 bg-opacity-30 group-hover:bg-opacity-100 cursor-pointer">
          <FluentChevronRight width={"24"} height={"24"}/>
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
      className="absolute z-[1] top-[50%] left-[0px] group">
      <div className="rounded-full shadow-md overflow-hidden group-hover:shadow-lg border-2 border-transparent group-hover:border-2 group-hover:border-neutral-300">
        <div className="bg-white text-neutral-600 bg-opacity-30 group-hover:bg-opacity-100 cursor-pointer">
          <FluentChevronLeft width={"24"} height={"24"}/>
        </div>
      </div>
    </div>
  );
}

export default function YmalCarousel({
  children,
  settings = {},
  breakpoints = [],
}) {
  const breakpoint_value = useBreakpointValue(breakpoints);
  const predefined = {
    dots: false,
    infinite: false,
    speed: 500,
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
