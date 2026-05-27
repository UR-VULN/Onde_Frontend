
// Helper to extract initials from Korean or English name
export const getInitials = (name: string) => {
  if (!name) return 'TR';
  if (name.length >= 2) {
    return name.slice(-2); // Take last 2 characters
  }
  return name;
};

// Helper to get color based on author name for beautiful colorful avatars
export const getAvatarBg = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#e0484d', '#27ae60', '#8e44ad', '#e67e22', '#2980b9', '#16a085'];
  return colors[hash % colors.length];
};

// Helper to format category labels in Korean
export const getCategoryLabel = (cat: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP') => {
  switch (cat) {
    case 'STAY': return '🏡 감성숙소';
    case 'FOOD': return '🍳 맛집탐방';
    case 'PHOTO': return '📸 인생샷';
    case 'TIP': return '💡 꿀팁공유';
  }
};

// Render Star Icons based on rating
export const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<i key={`f-${i}`} className="fa-solid fa-star"></i>);
  }
  if (hasHalf) {
    stars.push(<i key="h" className="fa-solid fa-star-half-stroke"></i>);
  }
  const emptyCount = 5 - stars.length;
  for (let i = 0; i < emptyCount; i++) {
    stars.push(<i key={`e-${i}`} className="fa-regular fa-star"></i>);
  }
  return stars;
};
