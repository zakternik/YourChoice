module.exports = {
    testEnvironment: "jsdom", // Potrebno za teste, ki uporabljajo DOM
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest" // Uporaba Babel-a za transformacijo JS/JSX
    },
    moduleFileExtensions: ["js", "jsx"],
    testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"], // Prepoznava test datotek
    transformIgnorePatterns: ["<rootDir>/node_modules/"]
  };
  