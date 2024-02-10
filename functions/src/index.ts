import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

admin.initializeApp();
const db = getFirestore();
const validApiKey = process.env.API_KEY;

interface RequestBody {
  teacher: string;
  guild_id: string;
  subject: string;
  title: string;
  memo: string;
  state: boolean;
  entry_user_avatar: string;
  entry_user_name: string;
  entry_user_id: string;
  entry_date: string;
}

export const external = onRequest(async (request, response) => {
  const apiKey = request.headers["api-key"];

  if (!apiKey || apiKey !== validApiKey) {
    response.status(403).send("not authorized");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const requestData: RequestBody = request.body;

    const collectionName = `notice/external/scholar_sync/guild_id/${requestData.guild_id}`;
    const doc = await db.collection(collectionName).add({
      teacher: requestData.teacher,
      guildId: requestData.guild_id,
      subject: requestData.subject,
      title: requestData.title,
      memo: requestData.memo,
      state: requestData.state,
      entry_user_avater: requestData.entry_user_avatar,
      entry_user_name: requestData.entry_user_name,
      entry_user_id: requestData.entry_user_id,
      entry_date: new Date(requestData.entry_date),
    });
    response.status(200).send(`Document written with ID: ${doc.id}`);
  } catch (error) {
    logger.error("Error: ", error);
    response.status(500).send("Internal Server Error");
    return;
  }
});
