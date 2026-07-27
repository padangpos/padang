import Image from 'next/image';

const logoAssets = {
  horizontal: { src: '/brand/padaeng-logo-horizontal.png', width: 1070, height: 380 },
  mark: { src: '/brand/padaeng-mark.png', width: 410, height: 395 },
  avatar: { src: '/brand/padaeng-line-avatar.png', width: 215, height: 235 },
  receipt: { src: '/brand/padaeng-receipt-header.png', width: 265, height: 180 },
  sticker: { src: '/brand/padaeng-shop-sticker.png', width: 355, height: 180 },
} as const;

type BrandLogoProps = {
  variant?: keyof typeof logoAssets;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ variant = 'horizontal', className = '', priority = false }: BrandLogoProps) {
  const asset = logoAssets[variant];

  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt="ป้าแดง POS"
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
