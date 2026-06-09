import Image from "next/image";

export function BrandLogo() {
  return (
    <div className="w-full" aria-label="Subliexpresate">
      <Image
        src="/subliepresate.png"
        alt="Subliexpresate"
        width={528}
        height={210}
        priority
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
