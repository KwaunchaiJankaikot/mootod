module.exports = {
  presets: [
    '@babel/preset-env',  // ใช้ preset-env สำหรับการแปลงโค้ด JavaScript
  ],
  plugins: [
    '@babel/plugin-transform-runtime'  // ใช้ plugin สำหรับรองรับ runtime ที่จำเป็น
  ]
};
