import { currentUser } from "@clerk/nextjs";
import { log } from "console";
import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "usuario no autentificado" },
        { status: 401 }
      );
    }
    const streamClient = StreamChat.getInstance(
      process.env._NEXT_PUBLIC_STREAM_KEY!,
      process.env.STREAM_SECRET
    );
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    const token = streamClient.createToken(user.id, expirationTime, issuedAt);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "internal error response" },
      { status: 500 }
    );
  }
}
