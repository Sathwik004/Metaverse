import Cube from "@/components/cube";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <div className="navbar">
        <h3>Metaverse</h3>
        <div>
          <Link href="/auth">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
      <div className="relative flex justify-center items-center">
        <Cube />
        <div className="absolute top-50">
          <h1 className="w-full text-center">
            Welcome to Metaverse
          </h1>
          <p className="text-center m-10">Connect, explore and interact in real-time rooms.</p>
          <Link href="/join" className="w-full flex justify-center mt-20">
            <Button variant={"outline"} className="text-3xl font-medium font-sane py-8 px-20">Join Space</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
