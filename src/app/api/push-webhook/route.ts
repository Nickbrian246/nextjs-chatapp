import { clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import webPush, { WebPushError } from "web-push";
export async function POST(req: Request) {
  try {
    const streamClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_KEY || "",
      process.env.STREAM_SECRET || ""
    );

    const rawBody = await req.text();
    const validateRequest = streamClient.verifyWebhook(
      rawBody,
      req.headers.get("x-signature") || ""
    );

    if (!validateRequest) {
      return NextResponse.json(
        { error: "Webhook signature invalid" },
        { status: 401 }
      );
    }
    const event = JSON.parse(rawBody);
    const sender = event.user;
    const recipientIds = event.channel.members
      //@ts-ignore
      .map((member) => member.user_id)
      //@ts-ignore
      .filter((id) => id !== sender.id);
    const channelId = event.channel.id;

    const recipients = (
      await clerkClient.users.getUserList({
        userId: recipientIds,
      })
    ).filter((user) => !user.unsafeMetadata.mutedChannels?.includes(channelId));

    const pushPromises = recipients
      .map((recipient) => {
        const subscription = recipient.privateMetadata.subscription || [];
        return subscription.map((subscription) =>
          webPush
            .sendNotification(
              subscription,
              JSON.stringify({
                titile: sender.name,
                body: event.message.text,
                icon: sender.image,
                iamge:
                  event.message.attachments[0]?.image_url ||
                  event.message.attachments[0]?.thumb_url,
                channelId,
              }),
              {
                vapidDetails: {
                  subject: "nicknbjm@gmial.com",
                  publicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || "",
                  privateKey: process.env.WEB_PUSH_PRIVATE_KEY || "",
                },
              }
            )
            .catch((err) => {
              console.log("error sending push notification", err);
              if (err instanceof WebPushError && err.statusCode === 410) {
                console.log("push subscription expired");

                clerkClient.users.updateUser(recipient.id, {
                  privateMetadata: {
                    subscription:
                      recipient.privateMetadata.subscription?.filter(
                        (s) => s.endpoint !== subscription.endpoint
                      ),
                  },
                });
              }
            })
        );
      })
      .flat();
    await Promise.all(pushPromises);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Missing push suscription Body" },
      { status: 400 }
    );
  }
}
