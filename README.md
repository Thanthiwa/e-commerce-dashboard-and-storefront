Markdown
# E-Commerce Management System with Data Mining Techniques 🛒🚀
(ระบบบริหารจัดการร้านค้าออนไลน์ ด้วยเทคนิคการทำเหมืองข้อมูล)

This repository contains the source code for an advanced e-commerce platform that integrates **Data Mining (Apriori Algorithm)** and **RFM Analysis** to provide intelligent product recommendations and customer segmentation. 

It is divided into two main parts: the **Customer Storefront** and the **Admin Dashboard**.

## 🌟 Key Features

### 🛍️ Customer Storefront (หน้าร้านค้าออนไลน์)
- **Responsive Design:** Fully optimized for mobile and desktop screens.
- **Intelligent Product Recommendation:** Displays "Frequently Bought Together" items powered by the Apriori Algorithm.
- **Cart & Checkout System:** Real-time subtotal calculation and smooth checkout flow.
- **Payment Verification:** Users can upload payment slips for admin approval.

### ⚙️ Admin Dashboard (ระบบแผงควบคุมหลังบ้าน)
- **Auto-Inventory Deduction:** Automatically deducts product stock accurately upon slip approval (prevents overselling).
- **Data Mining Engine:** Admins can configure Minimum Support and Confidence to generate Association Rules for product recommendations.
- **Customer Segmentation (RFM):** Automatically categorizes customers (e.g., Champions, At Risk) based on Recency, Frequency, and Monetary data.
- **Data Visualization:** Real-time sales statistics and top-selling product charts.
- **Product & Order Management:** Full CRUD operations for categories, products, and incoming orders.

## 💻 Tech Stack (เทคโนโลยีที่ใช้พัฒนา)

- **Frontend:** Next.js, React.js, Tailwind CSS
- **Backend:** Node.js (Next.js API Routes)
- **Database:** MongoDB, Mongoose (NoSQL)
- **Language:** TypeScript / JavaScript
- **Deployment:** Vercel

## 🚀 Getting Started (วิธีการติดตั้งและรันโปรเจกต์)

### Prerequisites (สิ่งที่ต้องมี)
- Node.js (Version 18.x or later)
- MongoDB Database (Local or MongoDB Atlas)

### Installation (ขั้นตอนการติดตั้ง)

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Maitvplay/e-commerce-dashboard-and-storefront.git](https://github.com/Maitvplay/e-commerce-dashboard-and-storefront.git)
   cd e-commerce-dashboard-and-storefront

   
2. **Install dependencies:**
   npm install

3. **Set up Environment Variables:**
   Create a .env or .env.local file in the root directory and add your connection strings
   MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000

4. **Run the development server:**
Bash
npm run dev

5. **Open your browser:**
Navigate to http://localhost:3000 to view the application.

🧠 Algorithms Used (อัลกอริทึมที่ใช้ในระบบ)
Market Basket Analysis (Apriori Algorithm): Used to calculate Support, Confidence, and Lift to find relationships between products.

RFM Analysis: Used to assign scores to customers based on their purchase history, helping in targeted marketing.

👨‍💻 Developer
Thanthiwa Suwasri
Computer Science, Huachiew Chalermprakiet University

This project is part of a Computer Science undergraduate thesis
