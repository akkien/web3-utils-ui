import Footer from "../components/footer";
import Image from "next/image";
import aave from "/public/images/aave_small.png";

export default function Home() {
  return (
    <div className='flex flex-col justify-between space-y-2'>
      <section className='relative z-0'>
        <Image src={aave} alt='Lending history' fill className='blur-sm' />
        <div className='relative z-10 flex flex-col justify-center items-center py-32'>
          <div className='max-w-[680px]'>
            <p className='text-white text-center text-5xl'>
              Empowering Traders with <br /> Credit Points
            </p>
            <br />
            <br />
            <p className='text-white text-xl'>
              At VerinLayer, we help traders turn their borrowing history into valuable credit points. Our mission is to
              provide a transparent and efficient verification layer for all your financial needs.
            </p>
          </div>
          <button className='mt-6 bg-blue-500 hover:bg-blue-300 text-white py-2 px-4 rounded-3xl'>Contact Us</button>
        </div>
      </section>
      <div className='py-24'>
        <p className='text-4xl font-quick font-semibold pb-4'>How is our point calculated?</p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto incidunt aperiam at optio iusto id iure.
        Odio impedit delectus voluptate, mollitia tenetur quas, dolor voluptatem veritatis id fugiat assumenda fugit
        veniam corporis vel commodi nostrum cumque nam nemo facere porro rerum consectetur eos explicabo! Exercitationem
        velit, pariatur consectetur, modi nesciunt atque perferendis vitae fugiat porro hic dolor commodi iure dicta
        quam quod est beatae odio placeat nobis minus sed. Quam, ad sapiente autem quo perferendis incidunt iusto et
        suscipit adipisci eum quibusdam quas? Corporis atque perferendis rerum quam amet aliquid totam eum cumque ipsam
        voluptatibus quo veniam doloremque dolorem sit, ad, ipsa numquam, in hic voluptatem. Voluptatibus dignissimos
        autem pariatur laudantium debitis, quod voluptates officia. Accusamus harum maiores omnis fugiat, ducimus
        doloribus odio obcaecati sequi placeat laboriosam officiis soluta animi distinctio consequuntur necessitatibus.
        Recusandae incidunt minus similique quae voluptatibus voluptates sequi natus? Labore architecto nesciunt
        doloremque, voluptatibus optio quo cupiditate ex autem nisi alias ea facere dolorem odio, eveniet cumque fugit
        mollitia pariatur similique distinctio aliquid tempore ipsam. Optio dolores rem impedit in ut voluptatem.
        Voluptatibus at fuga aliquam saepe aperiam. Atque laborum adipisci cumque pariatur officia? Eius expedita et
        quam incidunt quo sequi, voluptate nisi ipsum harum quidem quibusdam!
      </div>
      <div className='py-24'>
        <p className='text-4xl font-quick font-semibold pb-4'>Boost your defi profile with 4 simple steps:</p>
        <ol>
          <li className='text-xl'>Step 1: Select lending project that you had borrowed tokens</li>
          <li className='text-xl'>Step 2: Click prove my points to blockchain</li>
          <li className='text-xl'>Step 3: Check out</li>
          <li className='text-xl'>
            Step 4: Go to lending project you want to borrow and enjoy better lending percentage{" "}
          </li>
        </ol>
      </div>

      <Footer />
    </div>
  );
}
