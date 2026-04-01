import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { SignOut, Loading: AuthLoading, Session } = useAuth();

  return (
    <header>
      Header
      <button
        type="button"
        onClick={async () => {
          await SignOut();
        }}
        className="cursor-pointer disabled:cursor-not-allowed"
        disabled={AuthLoading}
      >
        LogOut
      </button>
      <div>
        Session Info:
        <p>Email: {Session?.user.email}</p>
      </div>
    </header>
  );
}
