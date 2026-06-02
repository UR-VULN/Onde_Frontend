import React from 'react';
import { hasDisplayImage } from '@/utils/listingDisplay';

interface ListingThumbnailProps {
  imageUrl?: string;
  alt: string;
  iconClass: string;
  className?: string;
  imgClassName?: string;
}

export const ListingThumbnail: React.FC<ListingThumbnailProps> = ({
  imageUrl,
  alt,
  iconClass,
  className = '',
  imgClassName = '',
}) => {
  if (hasDisplayImage(imageUrl)) {
    return <img src={imageUrl} alt={alt} className={imgClassName || className} loading="lazy" />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}
      aria-hidden
    >
      <i className={`fa-solid ${iconClass}`} />
    </div>
  );
};
