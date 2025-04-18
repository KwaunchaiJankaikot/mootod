axios.get('http://localhost:5000/menus')  // เชื่อมต่อ API จาก backend
  .then(response => {
    this.menus = response.data;
  })
  .catch(error => {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', error);
  });
