function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="
        grid h-10 w-10 place-items-center
        rounded-full
        theme-muted
        transition
        theme-hover
      "
    >
      {children}
    </button>
  );
}

export default IconButton;
