export default function Home() {
  return (
    <div className="flex gap-2 text-white">
      <a
        href="signin"
        className="block w-40 cursor-pointer gap-2 rounded-full bg-black px-6 py-3 text-center hover:bg-black/80"
      >
        Sign in
      </a>
      <a
        href="profile"
        className="block w-40 cursor-pointer gap-2 rounded-full bg-black px-6 py-3 text-center hover:bg-black/80"
      >
        Profile
      </a>
    </div>
  );
}
