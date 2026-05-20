import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

// Component
import IconsNavbar from "./IconsNavbar";
import IconButton from "./IconButton";

function Buttons() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === "dark" ? "Ganti ke light mode" : "Ganti ke dark mode";

  return (
    <div className="flex items-center gap-2">
      
      <IconButton label="Notifikasi">
        <IconsNavbar>
            <path 
              d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
        </IconsNavbar>
      </IconButton>

      <IconButton label={nextThemeLabel} onClick={toggleTheme}>
        {theme === "dark" ? 
        <IconsNavbar>
          <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M19 5l1.4-1.4M3.6 20.4 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
        </IconsNavbar>
        : 
        <IconsNavbar>
          <path d="M20 14.4A7.8 7.8 0 0 1 9.6 4a8 8 0 1 0 10.4 10.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </IconsNavbar>
        
        }
      </IconButton>

      <button
        type="button"
        onClick={toggleLanguage}
        className="
          h-9 min-w-11
          rounded-full
          border border-zinc-700
          px-3
          text-xs font-bold uppercase tracking-wider
          text-zinc-300
          transition
          hover:border-zinc-500 hover:bg-zinc-800 hover:text-white
        "
      >
        {language === "id" ? "ID" : "EN"}
      </button>
    </div>
  );
}

export default Buttons;
