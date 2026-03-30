interface AppHeaderProps {
  visible?: boolean;
}

export function AppHeader({ visible = true }: AppHeaderProps) {
  return (
    <header className={`app-header${visible ? "" : " app-header--hidden"}`}>
      <span className="app-header__icon">💬</span>
      <div className="app-header__title-block">
        <span className="app-header__name">Guttr</span>
        <span className="app-header__caption">Comic book reader</span>
      </div>
      <span className="badge">100% private</span>
    </header>
  );
}
