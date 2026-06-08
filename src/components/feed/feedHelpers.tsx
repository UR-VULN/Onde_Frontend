
// Helper to extract initials from Korean or English name (retained for fallback)
export const getInitials = (name: string) => {
  if (!name) return 'TR';
  if (name.length >= 2) {
    return name.slice(-2); // Take last 2 characters
  }
  return name;
};

// Helper to get color based on author name for beautiful colorful avatars (retained for fallback)
export const getAvatarBg = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#e0484d', '#27ae60', '#8e44ad', '#e67e22', '#2980b9', '#16a085'];
  return colors[hash % colors.length];
};

// Helper to get category avatar emoji
export const getCategoryAvatar = (cat: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP' | 'REVIEW' | 'COMPANION') => {
  switch (cat) {
    case 'STAY': return '🏡';
    case 'FOOD': return '🍳';
    case 'PHOTO':
    case 'REVIEW': return '📸';
    case 'TIP':
    case 'COMPANION': return '💡';
    default: return '📸';
  }
};

// Helper to format date nicely
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      return `${parts[0]}. ${parts[1]}. ${parts[2]}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
};

// Helper to format category labels in Korean
export const getCategoryLabel = (cat: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP' | 'REVIEW' | 'COMPANION') => {
  switch (cat) {
    case 'STAY': return '🏡 감성숙소';
    case 'FOOD': return '🍳 맛집탐방';
    case 'PHOTO':
    case 'REVIEW': return '📸 인생샷';
    case 'TIP':
    case 'COMPANION': return '💡 꿀팁공유';
    default: return '📸 여행기';
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
