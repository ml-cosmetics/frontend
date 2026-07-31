"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Keeps admin and operator surfaces on the light Aura Vénus theme.
 * A previous dark preference is cleared so these routes never switch back.
 */
export function ForceLightTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setTheme("light");
  }, [setTheme]);

  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html:
          "(function(){try{document.documentElement.classList.remove('dark');localStorage.setItem('theme','light');}catch(e){}})();",
      }}
    />
  );
}
