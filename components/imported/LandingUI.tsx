'use client';

import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';
import { Dictionary, Locale } from '@/types';
import { NavigationHeader } from '@/components/layout/NavigationHeader';

interface LandingUIProps {
  dict: Dictionary;
  lang: Locale;
  pieces?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    creatorName: string;
  }>;
}

const Icon = ({ icon, className, style }: { icon: string; className?: string; style?: React.CSSProperties }) => {
  const icons: { [key: string]: React.ReactNode } = {
    audioVisual: <svg width="20" height="16" viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.49524 16.8779C1.94524 16.8779 1.47457 16.6823 1.08324 16.2909C0.691239 15.8989 0.495239 15.4279 0.495239 14.8779V2.87793C0.495239 2.32793 0.691239 1.85726 1.08324 1.46593C1.47457 1.07393 1.94524 0.87793 2.49524 0.87793H14.4952C15.0452 0.87793 15.5162 1.07393 15.9082 1.46593C16.2996 1.85726 16.4952 2.32793 16.4952 2.87793V7.37793L20.4952 3.37793V14.3779L16.4952 10.3779V14.8779C16.4952 15.4279 16.2996 15.8989 15.9082 16.2909C15.5162 16.6823 15.0452 16.8779 14.4952 16.8779H2.49524ZM2.49524 14.8779H14.4952V2.87793H2.49524V14.8779ZM3.49524 12.8779H13.4952L10.0452 8.37793L7.74524 11.3779L6.19524 9.37793L3.49524 12.8779Z" fill="currentColor"/></svg>,
    illustrations: <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.99524 20.8779C2.16191 20.8779 1.45357 20.5863 0.870239 20.0029C0.286906 19.4196 -0.00476074 18.7113 -0.00476074 17.8779V3.87793C-0.00476074 3.0446 0.286906 2.33626 0.870239 1.75293C1.45357 1.1696 2.16191 0.87793 2.99524 0.87793H16.9952C17.8286 0.87793 18.5369 1.1696 19.1202 1.75293C19.7036 2.33626 19.9952 3.0446 19.9952 3.87793V17.8779C19.9952 18.7113 19.7036 19.4196 19.1202 20.0029C18.5369 20.5863 17.8286 20.8779 16.9952 20.8779H2.99524ZM2.99524 18.8779H16.9952C17.2786 18.8779 17.5159 18.7819 17.7072 18.5899C17.8992 18.3986 17.9952 18.1613 17.9952 17.8779V3.87793C17.9952 3.5946 17.8992 3.35693 17.7072 3.16493C17.5159 2.9736 17.2786 2.87793 16.9952 2.87793H2.99524C2.71191 2.87793 2.47424 2.9736 2.28224 3.16493C2.09091 3.35693 1.99524 3.5946 1.99524 3.87793V17.8779C1.99524 18.1613 2.09091 18.3986 2.28224 18.5899C2.47424 18.7819 2.71191 18.8779 2.99524 18.8779ZM3.99524 16.8779L7.99524 12.8779L9.79524 14.6529L11.9952 11.8779L15.9952 16.8779H3.99524ZM5.99524 8.87793C5.44524 8.87793 4.97457 8.68193 4.58324 8.28993C4.19124 7.8986 3.99524 7.42793 3.99524 6.87793C3.99524 6.32793 4.19124 5.85726 4.58324 5.46593C4.97457 5.07393 5.44524 4.87793 5.99524 4.87793C6.54524 4.87793 7.01624 5.07393 7.40824 5.46593C7.79957 5.85726 7.99524 6.32793 7.99524 6.87793C7.99524 7.42793 7.79957 7.8986 7.40824 8.28993C7.01624 8.68193 6.54524 8.87793 5.99524 8.87793Z" fill="currentColor"/></svg>,
    music: <svg width="14" height="21" viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.99524 0.87793V12.6002C6.35607 12.2224 5.61941 11.989 4.82857 11.989C2.43441 11.989 0.495239 13.9779 0.495239 16.4335C0.495239 18.889 2.43441 20.8779 4.82857 20.8779C7.22274 20.8779 9.16191 18.889 9.16191 16.4335V5.32237H13.4952V0.87793H6.99524ZM4.82857 18.6557C3.63691 18.6557 2.66191 17.6557 2.66191 16.4335C2.66191 15.2113 3.63691 14.2113 4.82857 14.2113C6.02024 14.2113 6.99524 15.2113 6.99524 16.4335C6.99524 17.6557 6.02024 18.6557 4.82857 18.6557Z" fill="currentColor"/></svg>,
    sculptures: <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.99524 13.3779C2.16191 13.3779 1.45357 13.0863 0.870239 12.5029C0.286906 11.9196 -0.00476074 11.2113 -0.00476074 10.3779C-0.00476074 9.5446 0.286906 8.83626 0.870239 8.25293C1.45357 7.6696 2.16191 7.37793 2.99524 7.37793V5.37793C2.99524 4.82793 3.19124 4.35726 3.58324 3.96593C3.97457 3.57393 4.44524 3.37793 4.99524 3.37793H7.99524C7.99524 2.5446 8.28691 1.83626 8.87024 1.25293C9.45357 0.669596 10.1619 0.37793 10.9952 0.37793C11.8286 0.37793 12.5369 0.669596 13.1202 1.25293C13.7036 1.83626 13.9952 2.5446 13.9952 3.37793H16.9952C17.5452 3.37793 18.0162 3.57393 18.4082 3.96593C18.7996 4.35726 18.9952 4.82793 18.9952 5.37793V7.37793C19.8286 7.37793 20.5369 7.6696 21.1202 8.25293C21.7036 8.83626 21.9952 9.5446 21.9952 10.3779C21.9952 11.2113 21.7036 11.9196 21.1202 12.5029C20.5369 13.0863 19.8286 13.3779 18.9952 13.3779V17.3779C18.9952 17.9279 18.7996 18.3989 18.4082 18.7909C18.0162 19.1823 17.5452 19.3779 16.9952 19.3779H4.99524C4.44524 19.3779 3.97457 19.1823 3.58324 18.7909C3.19124 18.3989 2.99524 17.9279 2.99524 17.3779V13.3779ZM7.99524 11.3779C8.41191 11.3779 8.76591 11.2319 9.05724 10.9399C9.34924 10.6486 9.49524 10.2946 9.49524 9.87793C9.49524 9.46126 9.34924 9.10726 9.05724 8.81593C8.76591 8.52393 8.41191 8.37793 7.99524 8.37793C7.57857 8.37793 7.22457 8.52393 6.93324 8.81593C6.64124 9.10726 6.49524 9.46126 6.49524 9.87793C6.49524 10.2946 6.64124 10.6486 6.93324 10.9399C7.22457 11.2319 7.57857 11.3779 7.99524 11.3779ZM13.9952 11.3779C14.4119 11.3779 14.7659 11.2319 15.0572 10.9399C15.3492 10.6486 15.4952 10.2946 15.4952 9.87793C15.4952 9.46126 15.3492 9.10726 15.0572 8.81593C14.7659 8.52393 14.4119 8.37793 13.9952 8.37793C13.5786 8.37793 13.2246 8.52393 12.9332 8.81593C12.6412 9.10726 12.4952 9.46126 12.4952 9.87793C12.4952 10.2946 12.6412 10.6486 12.9332 10.9399C13.2246 11.2319 13.5786 11.3779 13.9952 11.3779ZM6.99524 15.3779H14.9952V13.3779H6.99524V15.3779ZM4.99524 17.3779H16.9952V5.37793H4.99524V17.3779Z" fill="currentColor"/></svg>,
    register: <svg width="96" height="96" viewBox="0 0 97 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M92.4952 48.3379L82.7352 37.1779L84.0952 22.4179L69.6552 19.1379L62.0952 6.37793L48.4952 12.2179L34.8952 6.37793L27.3352 19.1379L12.8952 22.3779L14.2552 37.1779L4.49524 48.3379L14.2552 59.4979L12.8952 74.2979L27.3352 77.5779L34.8952 90.3779L48.4952 84.4979L62.0952 90.3379L69.6552 77.5779L84.0952 74.2979L82.7352 59.5379L92.4952 48.3379ZM76.6952 54.2579L74.4552 56.8579L74.7752 60.2579L75.4952 68.0579L67.8952 69.7779L64.5352 70.5379L62.7752 73.4979L58.8152 80.2179L51.6952 77.1379L48.4952 75.7779L45.3352 77.1379L38.2152 80.2179L34.2552 73.5379L32.4952 70.5779L29.1352 69.8179L21.5352 68.0979L22.2552 60.2579L22.5752 56.8579L20.3352 54.2579L15.1752 48.3779L20.3352 42.4579L22.5752 39.8579L22.2152 36.4179L21.4952 28.6579L29.0952 26.9379L32.4552 26.1779L34.2152 23.2179L38.1752 16.4979L45.2952 19.5779L48.4952 20.9379L51.6552 19.5779L58.7752 16.4979L62.7352 23.2179L64.4952 26.1779L67.8552 26.9379L75.4552 28.6579L74.7352 36.4579L74.4152 39.8579L76.6552 42.4579L81.8152 48.3379L76.6952 54.2579Z" fill="currentColor"/><path d="M60.4043 42.5597L62.6202 37.6847L67.4952 35.4688L62.6202 33.2529L60.4043 28.3779L58.1884 33.2529L53.3134 35.4688L58.1884 37.6847L60.4043 42.5597Z" fill="currentColor"/><path d="M60.4043 53.1963L58.1884 58.0713L53.3134 60.2872L58.1884 62.5031L60.4043 67.3781L62.6202 62.5031L67.4952 60.2872L62.6202 58.0713L60.4043 53.1963Z" fill="currentColor"/><path d="M47.1089 43.4463L42.6771 33.6963L38.2452 43.4463L28.4952 47.8781L38.2452 52.3099L42.6771 62.0599L47.1089 52.3099L56.8589 47.8781L47.1089 43.4463ZM44.4321 49.6331L42.6771 53.4977L40.9221 49.6331L37.0575 47.8781L40.9221 46.1231L42.6771 42.2586L44.4321 46.1231L48.2966 47.8781L44.4321 49.6331Z" fill="currentColor"/></svg>,
    remix: <svg width="96" height="96" viewBox="0 0 97 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M76.6152 14.6179C69.9352 9.05788 61.6552 5.41788 52.4952 4.57788V12.6179C59.4152 13.3779 65.7352 16.1379 70.9352 20.2979L76.6152 14.6179Z" fill="currentColor"/><path d="M44.4952 12.6179V4.57788C35.3352 5.37788 27.0552 9.05788 20.3752 14.6179L26.0552 20.2979C31.2552 16.1379 37.5752 13.3779 44.4952 12.6179Z" fill="currentColor"/><path d="M20.4153 25.9378L14.7353 20.2578C9.17525 26.9378 5.53525 35.2178 4.69525 44.3778H12.7353C13.4953 37.4578 16.2553 31.1378 20.4153 25.9378Z" fill="currentColor"/><path d="M84.2553 44.3778H92.2953C91.4553 35.2178 87.8153 26.9378 82.2553 20.2578L76.5753 25.9378C80.7353 31.1378 83.4953 37.4578 84.2553 44.3778Z" fill="currentColor"/><path d="M28.4952 48.3779L42.2552 54.6179L48.4952 68.3779L54.7352 54.6179L68.4952 48.3779L54.7352 42.1379L48.4952 28.3779L42.2552 42.1379L28.4952 48.3779Z" fill="currentColor"/><path d="M48.4952 84.3779C36.0552 84.3779 25.0952 78.0179 18.6552 68.3779H28.4952V60.3779H4.49524V84.3779H12.4952V73.5779C20.4552 84.9379 33.5752 92.3779 48.4952 92.3779C67.9752 92.3779 84.4952 79.6979 90.2552 62.1379L82.4152 60.3379C77.4952 74.2979 64.1752 84.3779 48.4952 84.3779Z" fill="currentColor"/></svg>,
    release: <svg width="96" height="96" viewBox="0 0 97 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56.7352 40.1379L48.4952 36.3779L56.7352 32.6179L60.4952 24.3779L64.2552 32.6179L72.4952 36.3779L64.2552 40.1379L60.4952 48.3779L56.7352 40.1379ZM16.4952 56.3779L20.2552 48.1379L28.4952 44.3779L20.2552 40.6179L16.4952 32.3779L12.7352 40.6179L4.49524 44.3779L12.7352 48.1379L16.4952 56.3779ZM34.4952 36.3779L38.8552 26.7379L48.4952 22.3779L38.8552 18.0179L34.4952 8.37793L30.1352 18.0179L20.4952 22.3779L30.1352 26.7379L34.4952 36.3779ZM18.4952 82.3779L42.4952 58.3379L58.4952 74.3379L92.4952 36.0979L86.8552 30.4579L58.4952 62.3379L42.4952 46.3379L12.4952 76.3779L18.4952 82.3779Z" fill="currentColor"/></svg>,
    facebook: <svg width="24" height="24" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.1209 3.00293H3.8709C3.45605 3.00293 3.1209 3.33809 3.1209 3.75293V21.0029C3.1209 21.4178 3.45605 21.7529 3.8709 21.7529H21.1209C21.5357 21.7529 21.8709 21.4178 21.8709 21.0029V3.75293C21.8709 3.33809 21.5357 3.00293 21.1209 3.00293ZM18.9553 8.47559H17.4576C16.2834 8.47559 16.0561 9.0334 16.0561 9.85371V11.6607H18.8592L18.4936 14.4896H16.0561V21.7529H13.1334V14.492H10.6889V11.6607H13.1334V9.5748C13.1334 7.15371 14.6123 5.83418 16.7732 5.83418C17.8092 5.83418 18.6975 5.91152 18.9576 5.94668V8.47559H18.9553Z" fill="currentColor"/></svg>,
    instagram: <svg width="24" height="24" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.4952 6.88029C9.455 6.88029 7.00143 9.33386 7.00143 12.374C7.00143 15.4142 9.455 17.8678 12.4952 17.8678C15.5354 17.8678 17.9889 15.4142 17.9889 12.374C17.9889 9.33386 15.5354 6.88029 12.4952 6.88029ZM12.4952 15.9446C10.5291 15.9446 8.92464 14.3401 8.92464 12.374C8.92464 10.408 10.5291 8.8035 12.4952 8.8035C14.4613 8.8035 16.0657 10.408 16.0657 12.374C16.0657 14.3401 14.4613 15.9446 12.4952 15.9446ZM18.2139 5.37493C17.5041 5.37493 16.9309 5.94815 16.9309 6.65797C16.9309 7.36779 17.5041 7.941 18.2139 7.941C18.9238 7.941 19.497 7.37047 19.497 6.65797C19.4972 6.48942 19.4641 6.32248 19.3997 6.16672C19.3353 6.01096 19.2408 5.86944 19.1216 5.75025C19.0025 5.63107 18.8609 5.53657 18.7052 5.47217C18.5494 5.40776 18.3825 5.37472 18.2139 5.37493ZM23.2041 12.374C23.2041 10.8955 23.2175 9.43029 23.1345 7.9544C23.0514 6.24011 22.6604 4.71868 21.4068 3.46511C20.1505 2.20886 18.6318 1.82047 16.9175 1.73743C15.4389 1.6544 13.9738 1.66779 12.4979 1.66779C11.0193 1.66779 9.55411 1.6544 8.07821 1.73743C6.36393 1.82047 4.8425 2.21154 3.58893 3.46511C2.33268 4.72136 1.94428 6.24011 1.86125 7.9544C1.77821 9.43297 1.79161 10.8981 1.79161 12.374C1.79161 13.8499 1.77821 15.3178 1.86125 16.7937C1.94428 18.508 2.33536 20.0294 3.58893 21.283C4.84518 22.5392 6.36393 22.9276 8.07821 23.0106C9.55679 23.0937 11.022 23.0803 12.4979 23.0803C13.9764 23.0803 15.4416 23.0937 16.9175 23.0106C18.6318 22.9276 20.1532 22.5365 21.4068 21.283C22.663 20.0267 23.0514 18.508 23.1345 16.7937C23.2202 15.3178 23.2041 13.8526 23.2041 12.374ZM20.847 18.6901C20.6514 19.1776 20.4157 19.5419 20.038 19.9169C19.6604 20.2946 19.2988 20.5303 18.8113 20.7258C17.4023 21.2856 14.0568 21.1598 12.4952 21.1598C10.9336 21.1598 7.58536 21.2856 6.17643 20.7285C5.68893 20.533 5.32464 20.2973 4.94964 19.9196C4.57196 19.5419 4.33625 19.1803 4.14071 18.6928C3.58357 17.2812 3.70946 13.9356 3.70946 12.374C3.70946 10.8124 3.58357 7.46422 4.14071 6.05529C4.33625 5.56779 4.57196 5.2035 4.94964 4.8285C5.32732 4.45357 5.68893 4.21786 6.17643 4.02232C7.58536 3.4625 10.9336 3.58821 12.4952 3.58821C14.0568 3.58821 17.405 3.4625 18.8113 4.01964C19.2988 4.21518 19.663 4.45089 20.038 4.82589C20.4157 5.20089 20.6514 5.56518 20.847 6.05268C21.4041 7.46422 21.2782 10.8124 21.2782 12.374C21.2782 13.9356 21.4041 17.2839 20.847 18.6901Z" fill="currentColor"/></svg>,
    twitter: <svg width="24" height="24" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.1712 11.0366L20.7243 3.57715H19.172L13.4795 10.0528L8.93639 3.57715H3.69511L10.5667 13.3704L3.69511 21.1918H5.24743L11.2549 14.3519L16.0538 21.1918H21.2951M5.80769 4.7235H8.19249L19.1708 20.1018H16.7854" fill="currentColor"/></svg>,
  };
  return <div className={className} style={style}>{icons[icon]}</div>;
};

const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
    <div className="w-24 h-24 flex items-center justify-center">
      <Icon icon={icon} className="w-16 h-16" style={{ color: '#F1E7D3' }} />
    </div>
    <div className="space-y-4 text-left">
      <h3 className="text-2xl font-semibold" style={{ color: '#F1E7D3' }}>{title}</h3>
      <p className="text-base text-gray-300 leading-relaxed">{description}</p>
    </div>
  </div>
);

const FooterLinkColumn = ({ title, links, dict }: { title: string; links: Array<keyof Dictionary['landing']['footer']>; dict: Dictionary }) => (
  <div className="flex flex-col gap-2">
    <h4 className="font-semibold mb-2">{title}</h4>
    {links.map((link) => (
      <a key={link} href="#" className="text-sm text-muted-foreground hover:underline">
        {dict.landing.footer[link]}
      </a>
    ))}
  </div>
);

const CategoryButton = ({ icon, text }: { icon: string; text: string }) => (
  <button 
    className="flex items-center justify-center hover:opacity-90 transition-colors" 
    style={{ 
      backgroundColor: '#F1E7D3', 
      color: '#000',
      width: '306px',
      height: '97px',
      gap: '10px',
      opacity: 1,
      borderRadius: '8px',
      borderWidth: '2px',
      padding: '10px'
    }}
  >
    <Icon icon={icon} className="w-5 h-5" />
    <span style={{ 
      fontWeight: 600,
      fontSize: '24px',
      lineHeight: '20px',
      letterSpacing: '0%'
    }}>{text}</span>
  </button>
);

export default function LandingUI({ dict, lang, pieces = [] }: LandingUIProps) {
  const [showBanner, setShowBanner] = useState(true);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const router = useRouter();

  const displayPieces = pieces.length > 0 
    ? pieces 
    : Array(8).fill(null).map((_, i) => ({
        id: `placeholder-${i}`,
        title: 'Alebrije Alado',
        imageUrl: '/images/placeholder-art.png?width=2886',
        creatorName: 'Felipe Linares Vargas',
      }));

  const testimonials = [
    {
      name: 'Celestino Marquez',
      quote: 'Thanks to Manantial Blanco, my art sales have tripled!',
      img: '/testimonial-1.png',
    },
    {
      name: 'Lysandra Velez',
      quote: 'I can finally focus on creating while Manantial Blanco handles the rest.',
      img: '/testimonial-2.png',
    },
    {
      name: 'Joaquin Fierro',
      quote: 'The best platform for artists to monetize their work.',
      img: '/testimonial-3.png',
    },
    {
      name: 'Isabella Rios',
      quote: 'Thanks to Manantial Blanco, my art sales have tripled!',
      img: '/testimonial-1.png',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background font-sans">
      <NavigationHeader lang={lang} dict={dict} showPromoBar={showBanner} onClosePromoBar={() => setShowBanner(false)} />

      {/* Hero Section */}
      <section
        className="relative w-full h-[600px] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: "url('/images/hero-background.png?width=2886')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="mb-4"
            style={{
              fontWeight: 600,
              fontStyle: 'normal',
              fontSize: '90px',
              lineHeight: '90px',
              letterSpacing: '-2%',
              textAlign: 'center',
              verticalAlign: 'middle',
              color: '#F1E7D3'
            }}
          >
            {dict.landing.heroTitle}
          </h1>
          <p 
            className="max-w-2xl mx-auto mb-8"
            style={{
              fontWeight: 400,
              fontStyle: 'Regular',
              fontSize: '24px',
              lineHeight: '26px',
              letterSpacing: '-2%',
              textAlign: 'center',
              verticalAlign: 'middle'
            }}
          >
            {dict.landing.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Register Your Cultural IP Button (Connect Wallet) */}
            <button
              onClick={() => (isConnected ? router.push(`/${lang}/home`) : open())}
              className="px-8 py-4 bg-transparent rounded-full border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              style={{
                fontFamily: 'Public Sans',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '24px',
                lineHeight: '20px',
                letterSpacing: '0%',
                color: '#F1E7D3'
              }}
              aria-label={isConnected ? 'Wallet connected' : 'Connect wallet to register your cultural IP'}
            >
              {isConnected ? 'Register Your Cultural IP' : 'Register Your Cultural IP'}
            </button>
            
            {/* Work with Authentic Cultural IP Button (Explore Licensed Art) */}
            <a
              href="#catalog"
              className="px-8 py-4 text-black rounded-full transition-all duration-300"
              style={{
                backgroundColor: '#F1E7D3',
                fontFamily: 'Public Sans',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '24px',
                lineHeight: '20px',
                letterSpacing: '0%'
              }}
            >
              Work with Authentic Cultural IP
            </a>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <div className="py-16 text-center container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {dict.landing.tagline}
        </h2>
      </div>

      {/* Explore Section */}
      <div id="catalog" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="mb-8" style={{
          fontWeight: 600,
          fontSize: '32px',
          lineHeight: '20px',
          letterSpacing: '0%'
        }}>
          {dict.landing.exploreTitle}
        </h2>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 mb-8" style={{ gap: '40px' }}>
          <CategoryButton icon="audioVisual" text={dict.landing.categories.audioVisual} />
          <CategoryButton icon="illustrations" text={dict.landing.categories.illustrations} />
          <CategoryButton icon="music" text={dict.landing.categories.music} />
          <CategoryButton icon="sculptures" text={dict.landing.categories.sculptures} />
        </div>

        {/* Search Bar */}
        <div className="border-b border-black pb-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex items-center gap-2 px-4 py-2 border rounded-md" style={{ backgroundColor: '#E3E3E333' }}>
              <Search className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder={dict.landing.searchPlaceholder}
                className="flex-1 bg-transparent outline-none text-sm"
                aria-label="Search artworks"
              />
            </div>
            <button 
              className="px-8 py-3 text-white rounded-full transition-colors w-full sm:w-auto shadow-md" 
              style={{ 
                backgroundColor: '#486B91',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '15px',
                lineHeight: '20px',
                letterSpacing: '0%'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a5576'} 
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#486B91'}
            >
              {dict.common.search}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold">
              {dict.landing.recommendedTitle}
            </h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm" aria-label="Sort options">
                <span>{dict.common.sortBy}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm" aria-label="Category filter">
                <span>{dict.common.category}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {displayPieces.map((piece) => (
              <Link key={piece.id} href={`/${lang}/piece/${piece.id}`} className="group">
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={piece.imageUrl}
                    alt={piece.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold text-sm truncate">{piece.title}</h4>
                  <p className="text-xs text-muted-foreground">por {piece.creatorName}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-end">
            <button className="text-sm font-medium text-blue-600 hover:underline">
              {dict.common.viewMore}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-black py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
            <FeatureItem
              icon="register"
              title={dict.landing.features.registerIP.title}
              description={dict.landing.features.registerIP.description}
            />
            <FeatureItem
              icon="remix"
              title={dict.landing.features.remixArt.title}
              description={dict.landing.features.remixArt.description}
            />
            <FeatureItem
              icon="release"
              title={dict.landing.features.releaseRemix.title}
              description={dict.landing.features.releaseRemix.description}
            />
          </div>
        </div>
      </section>

      {/* Why Cultural IP Section */}
      <section className="text-accent-foreground" style={{ backgroundColor: '#F1E7D3' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/2">
              <Image
                src="/images/cultural-ip.jpg" // Replace with your image
                alt="Artist working on a sculpture"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="mb-4" style={{ 
                fontWeight: 600,
                fontSize: '32px',
                lineHeight: '32px',
                letterSpacing: '0%'
              }}>
                {dict.landing.whyCulturalIP.title}
              </h2>
              <div className="text-muted-foreground">
                <p className="mb-4">
                  {dict.landing.whyCulturalIP.description}
                </p>
                <p>
                  {dict.landing.whyCulturalIP.description2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            {dict.landing.testimonials.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="border rounded-md p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.img}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
