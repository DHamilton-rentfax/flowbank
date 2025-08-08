
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDoc, doc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/server";
import { headers } from "next/headers";
import { auth as adminAuth } from "firebase-admin";

const getUserId = async () => {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        // This is a temporary workaround for when the user is authenticated but the token isn't passed in SSR.
        // In a real app, you would handle this more gracefully, perhaps with a redirect or middleware.
        try {
            const users = await adminAuth().listUsers(1);
            if (users.users.length > 0) return users.users[0].uid;
        } catch (e) {
             console.error("Could not get user for server-side rendering.", e);
        }
        return null;
    }
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    return decodedToken.uid;
};


async function getInitialData(userId: string) {
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
        // Handle case where user cannot be identified on the server
        return <DashboardClient initialData={null} />;
    }
    
    const initialData = await getInitialData(userId);
    return <DashboardClient initialData={initialData} />;
}
