import blurredIconsImg from "./blurred-icons.webp";

const C_PATH =
  "M1199 .922c0 159.13-63.16 311.742-175.59 424.264C910.983 537.708 758.497 600.922 599.5 600.922s-311.482-63.214-423.91-175.736C63.161 312.664 0 160.052 0 .922h262.041c0 89.574 35.554 175.48 98.84 238.818C424.167 303.079 510 338.662 599.5 338.662s175.334-35.583 238.619-98.922c63.286-63.338 98.84-149.244 98.84-238.818H1199Z";

function WaveSvg({ clipId, className }: { clipId: string; className: string }) {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1199 601"
      fill="none"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={C_PATH} />
        </clipPath>
      </defs>
      <image
        href={blurredIconsImg.src}
        x="0"
        y="0"
        width="1199"
        height="601"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}

export function HeroArchDecor() {
  return (
    <>
      <WaveSvg
        clipId="clip-left"
        className="pointer-events-none absolute top-0 right-full z-6 w-full max-w-6xl opacity-30"
      />
      <WaveSvg
        clipId="clip-right"
        className="pointer-events-none absolute top-0 left-full z-6 w-full max-w-6xl opacity-30"
      />
    </>
  );
}
