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
        <div className="absolute top-50 h-auto">
          <h1 className="w-full text-center">
            Welcome to Metaverse
          </h1>
          <p className="text-center m-10">Connect, explore and interact in real-time rooms.</p>
          <div className="flex justify-center">
            <Link href="/join" className="w-100 flex justify-center mt-10 mx-5">
              <Button variant={"outline"} className="w-full text-3xl font-medium font-sane py-8">Join Space</Button>
            </Link>
            <Link href="/dashboard" className="w-100 flex justify-center mt-10 mx-5">
              <Button variant={"outline"} className="w-full text-3xl font-medium font-sane py-8">Open Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
