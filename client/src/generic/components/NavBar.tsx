interface NavBarProps {
  content: string;
  connected: boolean;
  signOut: () => void;
}

export const NavBar = ({ content, connected, signOut }: NavBarProps) => {
  return (
    <nav className="nav-bar">
      <h2>{content}</h2>
      {connected ? (
        <button onClick={signOut} className="sign-out" type="button">
          Sign Out
        </button>
      ) : undefined}
    </nav>
  );
};
