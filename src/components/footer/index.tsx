import Link from "next/link";
import { FaTelegram } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";

export default function Footer() {
  return (
    <div className='rounded-xl mt-16 bg-sky-100 py-8 px-12 h-48 text-gray-500 flex flex-col justify-between'>
      <div className='flex justify-between'>
        <Link href='/'>
          <span className='font-handlee font-semibold hover:cursor-pointer'>Utils Playground</span>
        </Link>
        <div className='flex justify-between w-96 text-sm'>
          <div>
            <p className='font-bold'>Resources</p>
            <ul>
              <li>FAQ</li>
              <li>Help & Support</li>
            </ul>
          </div>
          <div>
            <p className='font-bold'>Developers</p>
            <ul>
              <li>Security</li>
              <li>Bug Bounty</li>
            </ul>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-between w-32'>
        <FaTelegram />
        <FaGithub />
        <FaDiscord />
      </div>
    </div>
  );
}
