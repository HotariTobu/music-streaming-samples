import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: string }[] = [
    { value: "light", icon: "☀️" },
    { value: "dark", icon: "🌙" },
    { value: "system", icon: "💻" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            w-8 h-8 rounded-md text-sm transition-all
            ${theme === value
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
            }
          `}
          title={value.charAt(0).toUpperCase() + value.slice(1)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
