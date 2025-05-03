'use client'
import { themeAtom } from "@/atoms/theme-atoms"
import { Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"


export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [localTheme, setLocalTheme] = useAtom(themeAtom)

  useEffect(()=> {
    if (theme) setLocalTheme(theme as 'light' | 'dark');
  }, [theme, setLocalTheme])

  const toggleTheme = () => {
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(newTheme);
    setTheme(newTheme);
  }

  return (
    <Button className="p-2 border m-2 dark:border-gray-700" variant="ghost" size="icon" onClick={toggleTheme}>
      {localTheme === 'dark' ? <Moon /> : <Sun />}
    </Button>
  )
}