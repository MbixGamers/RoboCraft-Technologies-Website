import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";

const features = [
  {
    title: "Circuit Schematics",
    description:
      "Every project includes detailed circuit diagrams and schematic drawings. See exactly how components connect before you pick up a single wire. Professional-grade diagrams for beginners and experts alike.",
    codeSnippet: `// Component connections — Arduino UNO
// LED Circuit
// PIN 13 --> 220Ω Resistor --> LED(+)
// GND    --> LED(-)

// Sensor Wiring
// 5V  --> VCC (DHT11)
// GND --> GND (DHT11)
// PIN 2 --> DATA (DHT11)
// Note: 10kΩ pull-up on DATA pin`,
    imagePosition: "left",
  },
  {
    title: "Step-by-Step Guides",
    description:
      "Follow clear, numbered build procedures that take you from raw parts to finished project. No guessing, no frustration — every step is explained with photos, tips, and common pitfalls to avoid.",
    codeSnippet: `/* Build Procedure
 * Step 1: Assemble the circuit on breadboard
 * Step 2: Connect power rails (5V / GND)
 * Step 3: Wire sensor to digital PIN 2
 * Step 4: Upload the sketch via Arduino IDE
 * Step 5: Open Serial Monitor at 9600 baud
 * Step 6: Verify sensor readings on screen
 */`,
    imagePosition: "right",
  },
  {
    title: "Full Source Code",
    description:
      "Every project ships with clean, commented, production-ready code. Download the sketch, flash it straight to your board, and understand every line thanks to thorough inline documentation.",
    codeSnippet: `#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin(); // initialise sensor
}

void loop() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  Serial.print("Temp: "); Serial.println(temp);
  Serial.print("Hum: ");  Serial.println(hum);
  delay(2000);
}`,
    imagePosition: "left",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              Everything You Need To
            </span>
            <br />
            <span className="bg-gradient-to-b from-orange-400 to-green-400 bg-clip-text text-transparent">
              Build & Learn
            </span>
          </h2>
        </div>

        <div className="space-y-16 sm:space-y-20 lg:space-y-32">
          {features.map((feature, key) => (
            <div
              key={key}
              className={`flex flex-col lg:flex-row items-center gap-8 sm:gap-12 ${
                feature.imagePosition === "right" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Code Section */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-green-500/20 
                  rounded-xl sm:rounded-2xl transition-all duration-500"
                  />
                  <div
                    className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 
                  rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden group-hover:border-1 
                  group-hover:border-orange-600/50 transition-all duration-300"
                  >
                    {/* Ide Interface */}
                    <div className="bg-gray-950 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm">
                      <div className="flex items-center sapce-x-1 sm:space-x-2 mb-3 sm:mb-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                        </div>
                        <span className="text-gray-400 ml-2 sm:ml-4 text-xs sm:text-sm">
                          {feature.title}
                        </span>
                      </div>
                      <div>
                        <SyntaxHighlighter
                          language="cpp"
                          style={nightOwl}
                          customStyle={{
                            margin: 0,
                            background: "transparent",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            lineHeight: "1.4",
                            height: "100%",
                          }}
                          wrapLines={true}
                        >
                          {feature.codeSnippet}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* text section */}
              <div className="flex-1 w-full">
                <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                  <h3 className="text-4xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-base text-xl sm:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
