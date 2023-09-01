import { useEffect, useState } from "react";

export default function useIsMobile(maxWidth = 768) {
  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);

    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  return width <= maxWidth;
}
