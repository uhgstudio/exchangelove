'use client';

import { useEffect } from 'react';

export default function AdSenseScript() {
  useEffect(() => {
    // AdSense 스크립트를 동적으로 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1595756211338642';
    script.crossOrigin = 'anonymous';
    
    // 이미 로드된 스크립트가 있는지 확인
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
