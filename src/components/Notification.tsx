import React, { useEffect, useState } from "react";
import { onNotify, type NotifyType } from "../utils/notify";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

interface Notice {
  id: string;
  type: NotifyType;
  message: string;
  duration: number;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const bgMap = {
  success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  error: "bg-red-500/20 border-red-500/30 text-red-300",
  warning: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  info: "bg-blue-500/20 border-blue-500/30 text-blue-300",
};

const Notification: React.FC = () => {
  const [list, setList] = useState<Notice[]>([]);

  useEffect(() => {
    const unsub = onNotify(({ type, message, duration = 3000 }) => {
      const id = crypto.randomUUID();

      const newItem: Notice = { id, type, message, duration };
      
      // We keep the logic for adding to the state the same, 
      // but the CSS will handle the visual order.
      setList((prev) => [...prev, newItem]);

      setTimeout(() => {
        setList((prev) => prev.filter((i) => i.id !== id));
      }, duration);
    });

    return unsub;
  }, []);

  return (
    /* Changed bottom-6 to top-6. Added flex-col-reverse so new ones appear "pushed" from the top */
    <div className="fixed top-6 right-6 z-[9999] flex flex-col-reverse gap-3 items-end">
      {list.map((item) => {
        const Icon = iconMap[item.type];
        const bgClass = bgMap[item.type];

        return (
          <div
            key={item.id}
            className={`
              min-w-[250px] px-4 py-3 border rounded-2xl backdrop-blur-xl shadow-xl
              /* Changed slide-in-from-bottom to slide-in-from-top */
              animate-in fade-in slide-in-from-top-5 duration-300 flex items-center gap-3
              ${bgClass}
            `}
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{item.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Notification;