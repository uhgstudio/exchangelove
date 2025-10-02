'use client'

import { useEffect } from 'react'

interface AdSenseProps {
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: boolean
  className?: string
}

export default function AdSense({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  responsive = true,
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-expect-error - AdSense global variable
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // @ts-expect-error - AdSense global variable
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-1595756211338642"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
