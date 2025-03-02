import { motion } from "framer-motion";

interface LoadingScreenProps {
  variant?: "fullscreen" | "inline";
  message?: string;
}

export function LoadingScreen({ 
  variant = "fullscreen",
  message = "Loading..." 
}: LoadingScreenProps) {
  const isFullscreen = variant === "fullscreen";

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${
      isFullscreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm" : "p-8"
    }`}>
      <motion.div
        className="relative w-20 h-20"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <motion.img
          src="/solospace-logo.png"
          alt="Loading"
          className="w-full h-full object-contain"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <motion.p
        className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
}
