import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "data/**"
    ]
  }
];

export default config;
