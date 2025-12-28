import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", icon: <Monitor className="h-4 w-4" /> },
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
