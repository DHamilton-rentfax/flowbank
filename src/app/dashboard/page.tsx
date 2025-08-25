import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    return initializeApp({ credential: cert(JSON.parse(json)) });
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export default async function DashboardHome() {
  const cookieName = process.env.NODE_ENV === "production" ? "__Secure-fbSession" : "fbSession";
  const sessionCookie = (await cookies()).get(cookieName)?.value;
  if (!sessionCookie) redirect("/login");

  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  const uid = decoded.sub;

  let plan: string = "free";
  try {
    const snap = await db.collection("users").doc(uid).get();
    plan = (snap.exists && (snap.data()?.plan as string)) || "free";
  } catch {
    plan = "free";
  }

  if (plan === "enterprise") redirect("/dashboard/enterprise");
  if (plan === "pro") redirect("/dashboard/pro");
  if (plan === "starter") redirect("/dashboard/starter");
  redirect("/dashboard/free");
}