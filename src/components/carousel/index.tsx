"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import bird from "/public/images/bird.jpeg";
import flower from "/public/images/flowers.jpeg";
import grape from "/public/images/grape.jpeg";
import jungle from "/public/images/jungle.jpeg";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";

const images = [bird, flower, grape, jungle];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("right");

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [currentIndex]);

  const nextSlide = () => {
    setDirection("right");
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setDirection("left");
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <div className='relative w-full max-w-4xl mx-auto'>
      <div className='relative overflow-hidden rounded-lg shadow-lg h-96'>
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform ease-in-out duration-700  ${
              index === currentIndex
                ? "translate-x-0 opacity-100"
                : direction === "right"
                ? "translate-x-full opacity-0"
                : "translate-x-[-100%] opacity-0"
            }`}
          >
            <Image src={image} alt={`Slide ${index}`} fill objectFit='cover' priority={index === currentIndex} />
          </div>
        ))}

        <button
          onClick={prevSlide}
          className='absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 p-2 rounded-full hover:bg-opacity-70'
        >
          <FaChevronLeft size={10} />
        </button>

        <button
          onClick={nextSlide}
          className='absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 p-2 rounded-full hover:bg-opacity-70'
        >
          <FaChevronRight size={10} />
        </button>

        <div className='absolute bottom-4 left-0 right-0 flex justify-center space-x-2'>
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
