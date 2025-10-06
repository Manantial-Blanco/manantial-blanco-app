import Image from 'next/image';
import { Dictionary } from '@/types';

interface FooterProps {
  dict: Dictionary;
}

export default function Footer({ dict }: FooterProps) {
  return (
    <footer className="bg-white px-6 md:px-12 pb-12">
      <div className="w-full h-px bg-black mb-4" />

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Logo & Socials */}
        <div className="flex flex-col gap-3">
          <Image
            src="/images/MB-logo-02.png"
            alt="MB Logo"
            width={46}
            height={46}
          />
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook">
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.1209 3.00293H3.8709C3.45605 3.00293 3.1209 3.33809 3.1209 3.75293V21.0029C3.1209 21.4178 3.45605 21.7529 3.8709 21.7529H21.1209C21.5357 21.7529 21.8709 21.4178 21.8709 21.0029V3.75293C21.8709 3.33809 21.5357 3.00293 21.1209 3.00293ZM18.9553 8.47559H17.4576C16.2834 8.47559 16.0561 9.0334 16.0561 9.85371V11.6607H18.8592L18.4936 14.4896H16.0561V21.7529H13.1334V14.492H10.6889V11.6607H13.1334V9.5748C13.1334 7.15371 14.6123 5.83418 16.7732 5.83418C17.8092 5.83418 18.6975 5.91152 18.9576 5.94668V8.47559H18.9553Z"
                  fill="black"
                />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.4952 6.88029C9.455 6.88029 7.00143 9.33386 7.00143 12.374C7.00143 15.4142 9.455 17.8678 12.4952 17.8678C15.5354 17.8678 17.9889 15.4142 17.9889 12.374C17.9889 9.33386 15.5354 6.88029 12.4952 6.88029ZM12.4952 15.9446C10.5291 15.9446 8.92464 14.3401 8.92464 12.374C8.92464 10.408 10.5291 8.8035 12.4952 8.8035C14.4613 8.8035 16.0657 10.408 16.0657 12.374C16.0657 14.3401 14.4613 15.9446 12.4952 15.9446ZM18.2139 5.37493C17.5041 5.37493 16.9309 5.94815 16.9309 6.65797C16.9309 7.36779 17.5041 7.941 18.2139 7.941C18.9238 7.941 19.497 7.37047 19.497 6.65797C19.4972 6.48942 19.4641 6.32248 19.3997 6.16672C19.3353 6.01096 19.2408 5.86944 19.1216 5.75025C19.0025 5.63107 18.8609 5.53657 18.7052 5.47217C18.5494 5.40776 18.3825 5.37472 18.2139 5.37493ZM23.2041 12.374C23.2041 10.8955 23.2175 9.43029 23.1345 7.9544C23.0514 6.24011 22.6604 4.71868 21.4068 3.46511C20.1505 2.20886 18.6318 1.82047 16.9175 1.73743C15.4389 1.6544 13.9738 1.66779 12.4979 1.66779C11.0193 1.66779 9.55411 1.6544 8.07821 1.73743C6.36393 1.82047 4.8425 2.21154 3.58893 3.46511C2.33268 4.72136 1.94428 6.24011 1.86125 7.9544C1.77821 9.43297 1.79161 10.8981 1.79161 12.374C1.79161 13.8499 1.77821 15.3178 1.86125 16.7937C1.94428 18.508 2.33536 20.0294 3.58893 21.283C4.84518 22.5392 6.36393 22.9276 8.07821 23.0106C9.55679 23.0937 11.022 23.0803 12.4979 23.0803C13.9764 23.0803 15.4416 23.0937 16.9175 23.0106C18.6318 22.9276 20.1532 22.5365 21.4068 21.283C22.663 20.0267 23.0514 18.508 23.1345 16.7937C23.2202 15.3178 23.2041 13.8526 23.2041 12.374ZM20.847 18.6901C20.6514 19.1776 20.4157 19.5419 20.038 19.9169C19.6604 20.2946 19.2988 20.5303 18.8113 20.7258C17.4023 21.2856 14.0568 21.1598 12.4952 21.1598C10.9336 21.1598 7.58536 21.2856 6.17643 20.7285C5.68893 20.533 5.32464 20.2973 4.94964 19.9196C4.57196 19.5419 4.33625 19.1803 4.14071 18.6928C3.58357 17.2812 3.70946 13.9356 3.70946 12.374C3.70946 10.8124 3.58357 7.46422 4.14071 6.05529C4.33625 5.56779 4.57196 5.2035 4.94964 4.8285C5.32732 4.4535 5.68893 4.21779 6.17643 4.02229C7.58536 3.46243 10.9309 3.58829 12.4925 3.58829C14.0541 3.58829 17.4023 3.46243 18.8113 4.01957C19.2988 4.21511 19.663 4.45082 20.038 4.82582C20.4157 5.20082 20.6514 5.56511 20.847 6.05261C21.4041 7.46422 21.2782 10.81 21.2782 12.3713C21.2782 13.9329 21.4041 17.2812 20.847 18.6901Z"
                  fill="black"
                />
              </svg>
            </a>
            <a href="#" aria-label="Twitter/X">
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.1712 11.0366L20.7243 3.57715H19.172L13.4795 10.0528L8.93639 3.57715H3.69511L10.5667 13.3704L3.69511 21.1918H5.24743L11.2549 14.3519L16.0538 21.1918H21.2951M5.80769 4.7235H8.19249L19.1708 20.1018H16.7854"
                  fill="black"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div className="flex flex-col gap-2 lg:w-[200px]">
          <h4 className="text-black text-[15px] font-['SF_Compact'] leading-5">
            {dict.landing.footer.company}
          </h4>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.aboutUs}
          </a>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.careers}
          </a>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.press}
          </a>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.blog}
          </a>
        </div>

        {/* Support Links */}
        <div className="flex flex-col gap-2 lg:w-[200px]">
          <h4 className="text-black text-[15px] font-['SF_Compact'] leading-5">
            {dict.landing.footer.support}
          </h4>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.contactUs}
          </a>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.faqs}
          </a>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.shippingReturns}
          </a>
          <a
            href="#"
            className="text-black text-[15px] font-['SF_Compact'] leading-5 hover:underline"
          >
            {dict.landing.footer.privacyPolicy}
          </a>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4 lg:w-[400px]">
          <div>
            <h4 className="text-black text-[15px] leading-5">
              {dict.landing.footer.newsletter}
            </h4>
            <p className="text-black text-[15px] leading-5">
              {dict.landing.footer.newsletterDescription}
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder={dict.landing.footer.emailPlaceholder}
              className="flex-1 px-3 py-2 border border-black rounded-lg outline-none text-[15px] leading-5"
              aria-label="Email address"
            />
            <button className="px-4 py-2 border border-black rounded-lg text-black text-[15px] leading-5 hover:bg-black hover:text-white transition-colors">
              {dict.common.subscribe}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
