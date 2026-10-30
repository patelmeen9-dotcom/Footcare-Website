export function isBrandLogoUrl(logo?: string | null) {
  if (!logo) return false;
  return /^https?:\/\//i.test(logo) || logo.startsWith("/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(logo);
}

export function BrandLogo({
  logo,
  name,
  className = "h-8 w-8",
}: {
  logo?: string | null;
  name: string;
  className?: string;
}) {
  const showImage = isBrandLogoUrl(logo);

  return (
    <div
      className={`bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo!} alt={`${name} logo`} className="object-contain w-full h-full" />
      ) : (
        <span className="text-[10px] font-bold text-primary uppercase tracking-tight px-1 text-center">
          {name.trim().slice(0, 2) || "BR"}
        </span>
      )}
    </div>
  );
}
