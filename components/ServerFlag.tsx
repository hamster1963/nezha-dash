import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { useEffect, useState } from "react";

export default function ServerFlag({ country_code }: { country_code: string }) {
  const [supportsEmojiFlags, setSupportsEmojiFlags] = useState(false);

  useEffect(() => {
    const checkEmojiSupport = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const emojiFlag = "🇺🇸"; // 使用美国国旗作为测试
      if (!ctx) return;
      ctx.fillStyle = "#000";
      ctx.textBaseline = "top";
      ctx.font = "32px Arial";
      ctx.fillText(emojiFlag, 0, 0);

      const support = ctx.getImageData(16, 16, 1, 1).data[3] !== 0;
      setSupportsEmojiFlags(support);
    };

    checkEmojiSupport();
  }, []);

  if (!country_code) return null;

  return (
    <span className="text-[12px] text-muted-foreground">
      {!supportsEmojiFlags ? (
        <span className={`fi fi-${country_code}`}></span>
      ) : (
        getUnicodeFlagIcon(country_code)
      )}
    </span>
  );
}
