
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDoc, doc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";


const getUserId = async () => {
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return null;
    }
};


async function getInitialData(userId: string) {
    const db = getAdminDb();
    const userDocRef = doc(db, "users", userId);
    const rulesCollectionRef = collection(db, "users", userId, "rules");
    const accountsCollectionRef = collection(db, "users", userId, "accounts");
    const transactionsQuery = query(collection(db, "users", userId, "transactions"), orderBy("date", "desc"));

    const [userDoc, rulesSnap, accountsSnap, transactionsSnap] = await Promise.all([
        getDoc(userDocRef),
        getDocs(rulesCollectionRef),
        getDocs(accountsCollectionRef),
        getDocs(transactionsQuery),
    ]);

    const userPlan = userDoc.exists() ? userDoc.data().plan : null;
    const rules = rulesSnap.docs.map(doc => doc.data());
    const accounts = accountsSnap.docs.map(doc => doc.data());
    const transactions = transactionsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    return { userPlan, rules, accounts, transactions };
}


export default async function DashboardPage() {
    const userId = await getUserId();
    
    if (!userId) {
        redirect("/login");
    }
    
    const initialData = await getInitialData(userId);
    return <DashboardClient initialData={initialData} />;
}
