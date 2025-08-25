export default function FAQPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">FAQ</h1>
      <details className="border rounded-md p-3">
        <summary className="font-medium">How do splits work?</summary>
        <p className="mt-2 text-sm text-gray-700">Create rules that route incoming deposits to destinations.</p>
      </details>
      <details className="border rounded-md p-3">
        <summary className="font-medium">Is my data secure?</summary>
        <p className="mt-2 text-sm text-gray-700">Yes. We use encrypted storage and best practices.</p>
      </details>
    </div>
  );
}