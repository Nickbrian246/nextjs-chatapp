import { clerkClient, currentUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PushSubscription } from "web-push";

export async function POST(request: Request) {
  try {
    const newSubscription: PushSubscription | undefined = await request.json();
    if (!newSubscription) {
      return NextResponse.json(
        { error: "Missing push suscription Body" },
        { status: 400 }
      );
    }

    console.log("Received push subscription to add:", newSubscription);

    const user = await currentUser();
    const { sessionId } = auth();

    if (!user || !sessionId) {
      return NextResponse.json(
        { error: "usuario no autentificado" },
        { status: 401 }
      );
    }
    const userSubscription = user.privateMetadata.subscription || [];

    const updateSubscription = userSubscription.filter(
      (subscription) => subscription.endpoint !== newSubscription.endpoint
    );

    updateSubscription.push({ ...newSubscription, sessionId });
    await clerkClient.users.updateUser(user.id, {
      privateMetadata: { subscription: updateSubscription },
    });

    return NextResponse.json(
      { message: "push suscription saved" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const subscriptionToDelete: PushSubscription | undefined = await req.json();
    if (!subscriptionToDelete) {
      return NextResponse.json(
        { error: "Missing push suscription Body" },
        { status: 400 }
      );
    }
    console.log("Recived push suscription to delete");
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "usuario no autentificado" },
        { status: 401 }
      );
    }

    const userSubscription = user.privateMetadata.subscription || [];

    const updateSubscription = userSubscription.filter(
      (subscription) => subscription.endpoint !== subscriptionToDelete.endpoint
    );

    await clerkClient.users.updateUser(user.id, {
      privateMetadata: { subscription: updateSubscription },
    });

    return NextResponse.json(
      { message: "push suscription deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
