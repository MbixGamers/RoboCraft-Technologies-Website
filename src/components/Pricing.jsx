import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Arduino",
    price: "Free",
    isPrice: false,
    description: "Perfect starting point for beginners",
    features: [
      "UNO, NANO, Pro Mini, Mega",
      "Full circuit schematics",
      "Step-by-step build guides",
      "Commented source code",
      "Materials list per project",
      "Community support",
    ],
    mostPopular: false,
    icon: "🔵",
  },
  {
    name: "ESP Series",
    price: "Free",
    isPrice: false,
    description: "WiFi & Bluetooth IoT projects",
    features: [
      "ESP8266 & ESP32 projects",
      "Full circuit schematics",
      "Step-by-step build guides",
      "Commented source code",
      "Materials list per project",
      "Community support",
      "IoT dashboard examples",
      "MQTT & HTTP examples",
    ],
    mostPopular: true,
    icon: "📡",
  },
  {
    name: "Raspberry Pi",
    price: "Free",
    isPrice: false,
    description: "Linux-powered SBC projects",
    features: [
      "Pi 4/5, Zero & Pico projects",
      "Full circuit schematics",
      "Step-by-step build guides",
      "Python & MicroPython code",
      "Materials list per project",
      "Community support",
      "OS configuration guides",
      "GPIO reference sheets",
      "Headless setup tutorials",
      "Camera & display projects",
    ],
    mostPopular: false,
    icon: "🍓",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              All Projects,
            </span>
            <br />
            <span className="bg-gradient-to-b from-orange-400 to-green-400 bg-clip-text text-transparent">
              Completely Free
            </span>
          </h2>
          <p className="text-gray-400 text-base text-xl sm:text-lg max-w-2xl mx-auto">
            Every schematic, guide, and line of code is open and free. Pick your
            platform and start building today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-6">
          {plans.map((plan, key) => (
            <div
              key={key}
              className={`relative bg-slate-900/50 backdrop-blur-sm border rounded-xl sm:rounded-2xl p-6 sm:p-8 transition-all duration-300 overflow-visible group flex flex-col h-full ${
                plan.mostPopular
                  ? "border-orange-500 shadow-2xl shadow-orange-500/20 lg:scale-105"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 pointer-events-none rounded-lg" />
              {plan.mostPopular && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center space-x-1 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-b from-orange-500 to-green-500 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    <Star className="w-3 h-3 sm:w-3 sm:h-3 fill-white" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <div className="text-4xl mb-3">{plan.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text 
                  text-transparent"
                  >
                    {plan.price}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-row">
                {plan.features.map((feature, featureKey) => (
                  <li
                    key={featureKey}
                    className="flex items-start space-x-2 sm:space-x-3"
                  >
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-300 mt-auto hover:scale-102 cursor-pointer text-sm sm:text-base ${
                  plan.mostPopular
                    ? "bg-gradient-to-b from-orange-500 to-green-500"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                Explore {plan.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-400 text-base text-xl">
            Have a project to share?{" "}
            <a href="#" className="text-orange-400 hover:text-orange-300">
              Submit your build
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
