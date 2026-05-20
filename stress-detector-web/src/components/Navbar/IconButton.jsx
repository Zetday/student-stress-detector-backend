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
        text-zinc-400
        transition
        hover:bg-zinc-800 hover:text-white
      "
    >
      {children}
    </button>
  );
}

export default IconButton;