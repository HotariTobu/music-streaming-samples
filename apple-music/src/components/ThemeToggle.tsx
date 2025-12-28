import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

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
        <Button
          key={value}
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(value)}
          className={theme === value ? "bg-background shadow-sm" : ""}
          title={value.charAt(0).toUpperCase() + value.slice(1)}
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}
