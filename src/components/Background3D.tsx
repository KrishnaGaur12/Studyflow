import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import FOG from 'vanta/dist/vanta.fog.min';

export function Background3D() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const myRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(FOG({
        el: myRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0xa5b4fc,
        midtoneColor: 0xc7d2fe,
        lowlightColor: 0xe5e7eb,
        baseColor: 0xffffff,
        blurFactor: 0.71,
        speed: 2.90,
        zoom: 0.40
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={myRef} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />;
}
