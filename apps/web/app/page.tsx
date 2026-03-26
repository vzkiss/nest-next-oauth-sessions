import Link from 'next/link';

const styles = {
  linkButton:
    'bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:ring-ring block w-40 cursor-pointer rounded-full px-6 py-3 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]',
};

export default function Home() {
  return (
    <div className="flex gap-2">
      <Link href="signin" className={styles.linkButton}>
        Sign in
      </Link>
      <Link href="profile" className={styles.linkButton}>
        Profile
      </Link>
    </div>
  );
}
