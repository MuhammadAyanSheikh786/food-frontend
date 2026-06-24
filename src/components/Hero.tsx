import { motion } from "framer-motion";
import { scrollToSection } from "../lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const floatingAnimation = (delay: number) => ({
  animate: {
    y: [0, -20, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
  },
});

export function Hero() {
  return (
    <>
      <section id="hero" className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-dark-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,146,60,0.08)_0%,_transparent_60%)]" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-primary-500/10 blur-3xl"
            {...floatingAnimation(0)}
          />
          <motion.div
            className="absolute top-1/3 right-[15%] w-96 h-96 rounded-full bg-primary-400/5 blur-3xl"
            {...floatingAnimation(1)}
          />
          <motion.div
            className="absolute bottom-1/4 left-[20%] w-64 h-64 rounded-full bg-primary-600/10 blur-3xl"
            {...floatingAnimation(2)}
          />
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 border border-white/5 rounded-full"
            {...floatingAnimation(0.5)}
          />
          <motion.div
            className="absolute bottom-1/3 right-[30%] w-20 h-20 border border-primary-500/20 rounded-full"
            {...floatingAnimation(1.5)}
          />
          <motion.div
            className="absolute top-1/2 left-[5%] w-16 h-16 bg-primary-500/10 rounded-full blur-sm"
            {...floatingAnimation(2.5)}
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-tight [text-shadow:0_4px_30px_rgba(0,0,0,0.3)]">
              Iqbal Food
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
              Premium Dining Experience
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 max-w-2xl mx-auto">
            <p className="text-base sm:text-lg text-dark-300 leading-relaxed">
              Discover exquisite flavors crafted with passion. From sizzling BBQ to gourmet burgers, every bite tells a story of culinary excellence.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => scrollToSection("menu")} className="btn-primary text-lg">
              Explore Our Menu
            </button>
            <button onClick={() => scrollToSection("menu")} className="btn-secondary text-lg">
              Order Now
            </button>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent pointer-events-none" />
      </section>

      <div id="menu" />
    </>
  );
}
