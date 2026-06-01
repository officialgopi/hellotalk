import { transformImage } from "@/utils/features";

interface AvatarCardProps {
  avatar?: string[];
  max?: number;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar = [], max = 3 }) => {
  const visibleAvatars = avatar.slice(0, max);
  const extraCount = avatar.length - max;
  // const isGroup = avatar.length > 1;

  // 1. PREMIUM CREATIVE TREATMENT: Dual Avatar Interlocking Layout (Iconic Messaging Style)
  if (avatar.length === 2) {
    return (
      <div className="relative w-10 h-10 flex-shrink-0 select-none">
        <img
          src={transformImage(avatar[0])}
          alt="User Node 1"
          className="absolute top-0 left-0 w-7 h-7 rounded-full border-2 border-white dark:border-[#141416] object-cover shadow-sm z-10"
        />
        <img
          src={transformImage(avatar[1])}
          alt="User Node 2"
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white dark:border-[#141416] object-cover shadow-sm z-20"
        />
      </div>
    );
  }

  // 2. MULTI-STACK ENGINE: Elegant Layered Micro-Rows for Large Group Arrays
  return (
    <div className="flex items-center -space-x-3.5 flex-shrink-0 select-none min-w-0">
      {visibleAvatars.map((url, index) => (
        <img
          key={index}
          src={transformImage(url)}
          alt={`Avatar Indicator ${index}`}
          style={{ zIndex: index + 1 }}
          className="w-10 h-10 rounded-full border-2 border-white dark:border-[#141416] bg-neutral-100 dark:bg-neutral-900 object-cover shadow-xs transition-colors duration-300 flex-shrink-0"
        />
      ))}

      {/* High-End Extra Counter Ring Element */}
      {extraCount > 0 && (
        <div
          style={{ zIndex: max + 1 }}
          className="w-10 h-10 rounded-full border-2 border-white dark:border-[#141416] bg-neutral-950 dark:bg-[#f3f3f3] flex items-center justify-center text-[10px] font-bold font-mono tracking-tighter text-white dark:text-neutral-950 shadow-xs flex-shrink-0"
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
};

export default AvatarCard;
