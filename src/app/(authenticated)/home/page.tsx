'use client'
import { useUser } from "@/hooks/use-users"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const HomePage = () => {
  const { user } = useUser()
  console.log(user?.record?.name)
  return (
    <section className="flex flex-col justify-center items-center h-screen">
      <div className="flex flex-col w-[350px]">
        <h1 className="text-6xl font-bold">Find</h1>
        <h1 className="text-6xl font-medium">Your<span className="font-extrabold text-6xl"> Career</span></h1>
        <h1 className="text-6xl font-medium text-right">Matches.</h1>
      </div>
      <div className="flex ml-10 gap-24">
        <Link href="/form-user-data">
          <div className="flex flex-col w-[350px] mt-10 hover:cursor-pointer p-5 hover:border hover:scale-110 hover:shadow-2xl transition-all rounded-xl gap-5">
            <h1 className="text-xl font-bold flex items-center gap-5">Start Journey <ArrowRight /></h1>
            <p className="text-[14px] font-medium text-justify">Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
          </div>
        </Link>
        <Link href="/resume">
          <div className="flex flex-col w-[350px] mt-10 hover:cursor-pointer p-5 hover:border hover:scale-110 hover:shadow-2xl transition-all rounded-xl gap-5">
            <h1 className="text-xl font-bold flex items-center gap-5">Upload Your CV <ArrowRight /></h1>
            <p className="text-[14px] font-medium text-justify">Lorem ipsum dolor sit amet consectetur adipisicing elit.Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
          </div>
        </Link>
      </div>

    </section>
  )
}

export default HomePage
