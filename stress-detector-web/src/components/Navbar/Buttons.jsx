import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

function Buttons() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? "Ganti ke light mode" : "Ganti ke dark mode";

  return (
    <div className="flex items-center gap-2">

      <button
        type="button"
        onClick={toggleLanguage}
        className="
          h-9 min-w-11
          rounded-full
          border theme-border
          px-3
          text-xs font-bold uppercase tracking-wider
          theme-muted
          transition
          theme-hover
        "
      >
        {language === "id" ? "ID" : "EN"}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={nextThemeLabel}
        title={nextThemeLabel}
        className="
          grid h-9 w-9 place-items-center
          rounded-full
          border theme-border
          theme-muted
          transition
          theme-hover
        "
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </div>
  );
}

export default Buttons;
