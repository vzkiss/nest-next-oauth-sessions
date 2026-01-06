export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl text-black mb-4">Routes</h1>
      <div className="flex gap-2 text-white">
        <a
          href="signin"
          className="flex items-center gap-2 py-3 px-6 bg-black hover:bg-black/80 text-white rounded-full cursor-pointer"
        >
          <span>Sign in</span>
        </a>
        <a
          href="profile"
          className="flex items-center gap-2 py-3 px-6 bg-black hover:bg-black/80 text-white rounded-full cursor-pointer"
        >
          <span>Profile</span>
        </a>
      </div>
    </div>
  );
}
