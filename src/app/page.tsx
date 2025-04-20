"use client";
import Footer from "@/components/footer";
import { Picker } from "@/components/picker";

export default function Home() {
  return (
    <div className='flex flex-col justify-between'>
      <Picker />
      <Footer />
    </div>
  );
}
