import MyAccountLinks from "@/app/components/atom/MyAccountLinks";

export default function MyAccountLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-charcoal dark:text-white tracking-tight mb-6">
          My Account
        </h1>
        <div className="flex flex-col md:flex-row gap-5 md:items-start">
          <aside className="w-full md:w-48 md:flex-shrink-0 md:sticky md:top-4">
            <MyAccountLinks />
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
