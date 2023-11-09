import User from "@/app/(models)/User";
import { NextResponse } from "next/server";
import bcrypt, { hash } from "bcrypt";

export async function POST(req) {
  try {
    const body = await req.json();
    const userData = body.formData;

    //Confirm data exists
    if (!userData?.email || !userData?.password || !userData?.name) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    //check for duplicate email
    const duplicate = await User.findOne({
      email: userData.email.toUpperCase(),
    })
      .lean()
      .exec();

    if (duplicate) {
      return NextResponse.json(
        { message: "A user already exists for this email." },
        { status: 409 }
      );
    }

    const hashPass = await bcrypt.hash(userData.password, 10);
    userData.password = hashPass;
    userData.email = userData.email.toUpperCase();

    await User.create(userData);
    return NextResponse.json({ message: "User Created." }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
