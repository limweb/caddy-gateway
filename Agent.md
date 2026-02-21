repo นี้ ต้องการทำ api gateway สำหรับ microservices
โดนใช้ caddy gen proxy reverse proxy ของ repo นี้
้https://github.com/limweb/caddy-gen ครับ
กรุณาช่วยอ่าน repo นี้ด้วย เพื่อ ช่วยในการ ออกแบบ ระบบครับ

เบื้องต้น

1. มี caddy-gen-proxy อยู่แล้ว port 80 443 เรียบร้อย
2. มี auth server คือ keycloak ที่ sso.shopsthai.com

สิ่งที่ต้องการใน repo นี้ สร้า ง

1. api.shopsthai.com เป็น api ที่ ต้อง validate jwt ครับ
   /me return ตัวอย่าง profile
   /datas return ตัวอย่าง data
   ใช้ bun elysiajs
   ใช้ folder api สำหรับ api
2. มี web1.shopsthai.com เป็น web application ใช้ keycloak.js และ บังคับ login ไปที่ sso.shopsthai.com
   ใช้ vuejs ในการทดสอบ
   ใช้ folder web1 สำหรับ web application

flow การทำงาน

1. browser ไปที่ web1.shopsthai.com
2. web1.shopsthai.com ไปที่ keycloak สำหรับ login
3. keycloak ให้ token กลับมา
4. web1.shopsthai.com ใช้ token ไปที่ api.shopsthai.com
5. api.shopsthai.com validate token และ return data
6. web1.shopsthai.com แสดง data
