export default {
    extends: [
      'eslint:recommended',  // ใช้กฎที่แนะนำจาก ESLint
      'plugin:vue/essential' // ใช้กฎของ Vue.js
    ],
    rules: {
      'no-console': 'off',   // อนุญาตให้ใช้ console ในระหว่างการพัฒนา
      'no-debugger': 'off',  // อนุญาตให้ใช้ debugger
      'semi': ['error', 'always'] // ให้มี semicolon ในทุกบรรทัด
    }
  };
  