// Minimal admin layout – removes missing AdminGuard import.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
 return <section className="container mx-auto p-6">{children}</section>;
}