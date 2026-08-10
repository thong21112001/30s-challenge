# ⚡ 30s Challenge - Daily Challenge Platform

> **30s Challenge** là một nền tảng thử thách hàng ngày đếm ngược 30 giây thời gian thực với kiến trúc **Server-Authoritative**, giúp nâng cao kỹ năng, rèn luyện tư duy và duy trì thói quen học tập mỗi ngày.

---

## 📖 Tổng quan dự án & Mục đích

Dự án **30s Challenge** được thiết kế nhằm mang lại trải nghiệm thử thách nhanh, hấp dẫn và công bằng cho người dùng. Mỗi ngày, hệ thống sẽ tự động gán **1 thử thách duy nhất** cho người dùng (tính theo ngày giờ UTC). Người dùng chỉ có đúng **30 giây** để đọc, suy nghĩ và hoàn thành bài thi.

### Mục đích dự án:
1. **Rèn luyện phản xạ & tư duy nhanh**: Giới hạn 30 giây buộc người dùng tập trung tối đa.
2. **Xây dựng thói quen hàng ngày (Daily Habit)**: Hệ thống Chuỗi ngày (Streak) khuyến khích người dùng quay lại mỗi ngày.
3. **Chống gian lận tuyệt đối (Server-Authoritative)**: Mọi mốc thời gian bắt đầu, đếm ngược và kiểm tra đáp án đều được xác thực nghiêm ngặt từ phía Server, ngăn chặn việc can thiệp vào Client Timer.
4. **Gamification (Trò chơi hóa)**: Tích hợp điểm kinh nghiệm (XP), cấp độ, bảng xếp hạng và các hiệu ứng ăn mừng trực quan.

---

## 🛠 Các công nghệ sử dụng (Tech Stack)

### **Frontend & Backend Framework**
- **[Next.js 16 (App Router)](https://nextjs.org/)**: Framework React hiện đại hỗ trợ Server Components, Server Actions, API Routes tối ưu hiệu năng.
- **[React 19](https://react.dev/)**: Thư viện giao diện người dùng mới nhất.
- **[TypeScript](https://www.typescriptlang.org/)**: Giúp viết code an toàn, rõ ràng với Type System chặt chẽ.

### **Database & ORM**
- **[PostgreSQL](https://www.postgresql.org/)**: Cơ sở dữ liệu quan hệ mạnh mẽ, tin cậy.
- **[Prisma ORM 6](https://www.prisma.io/)**: Công cụ quản lý schema, migration và truy vấn dữ liệu type-safe.

### **Styling & UI Components**
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework cho giao diện hiện đại, mượt mà và tương thích tốt trên mobile/desktop.
- **[Lucide React](https://lucide.dev/)**: Bộ icon hiện đại, tối giản.
- **[Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)**: Hiệu ứng pháo hoa khi hoàn thành thử thách xuất sắc.

### **Authentication & Security**
- **JWT (`jose`) & HTTP-Only Cookie**: Cơ chế xác thực session an toàn, chống XSS.
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Mã hóa mật khẩu người dùng trước khi lưu trữ.
- **Server-Authoritative Validation**: Đảm bảo toàn vẹn thời gian làm bài (30s) và kết quả thử thách từ phía Server.

---

## ✨ Tính năng chính

- 🎯 **Thử thách hàng ngày (Daily Assignment)**: Mẫu thử thách được chọn ngẫu nhiên/ấn định duy nhất cho mỗi tài khoản trong ngày.
- ⏱ **Bộ đếm thời gian 30s chuẩn Server**: Đếm ngược đồng bộ chuẩn xác. Nếu quá 30 giây kể từ mốc `startedAt`, session sẽ tự động hết hạn (`EXPIRED`).
- 🧩 **Đa dạng loại thử thách**:
  - **QUIZ (Trắc nghiệm)**: Chọn đáp án đúng trong các phương án.
  - **TEXT (Gõ nhanh)**: Gõ lại đoạn văn bản cho sẵn với độ chính xác và tốc độ cao.
  - **ACTION (Hành động / Câu đố ngắn)**: Thử thách logic hoặc thao tác phản xạ.
- 🔥 **Hệ thống Chuỗi & XP (Streaks & XP)**:
  - Tự động cộng điểm XP dựa trên độ khó thử thách (Easy, Medium, Hard).
  - Cập nhật **Current Streak** (Chuỗi hiện tại) và **Best Streak** (Chuỗi kỷ lục). Tự động reset streak nếu bỏ lỡ 1 ngày.
- 🏆 **Bảng xếp hạng (Leaderboard)**: Xem danh sách Top người chơi xuất sắc nhất theo tổng XP hoặc Chuỗi ngày.
- 📜 **Lịch sử làm bài (History)**: Thống kê chi tiết các thử thách đã làm, điểm số đạt được và trạng thái hoàn thành.
- 🛠 **Trang Quản trị (Admin Dashboard)**:
  - Quản lý kho thử thách (Tạo mới, chỉnh sửa, bật/tắt `isActive`).
  - Phân loại thử thách theo loại (`QUIZ`, `TEXT`, `ACTION`) và độ khó (`EASY`, `MEDIUM`, `HARD`).
  - Xem thống kê người dùng và các lượt tham gia.

---

## 📁 Cấu trúc thư mục dự án

```text
30s-challenge/
├── .agents/                # Quy tắc hệ thống agent & chính sách giao tiếp
├── prisma/
│   ├── schema.prisma       # Mô hình cơ sở dữ liệu Prisma (User, Challenge, Session, Submission, Stats)
│   └── seed.ts             # Script khởi tạo dữ liệu mẫu (Admin, User, Challenges)
├── public/                 # File tĩnh (Favicon, hình ảnh)
├── src/
│   ├── actions/            # Server Actions (auth-actions, challenge-actions, admin-actions)
│   ├── app/                # App Router Pages
│   │   ├── (auth)/         # Trang Đăng nhập / Đăng ký
│   │   ├── admin/          # Trang Quản trị viên (Dashboard, tạo/quản lý thử thách)
│   │   ├── history/        # Trang Lịch sử thử thách
│   │   ├── leaderboard/    # Trang Bảng xếp hạng
│   │   ├── profile/        # Trang Hồ sơ cá nhân & Thống kê
│   │   ├── globals.css     # CSS toàn cục & Tailwind import
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Trang chủ & Thử thách chính
│   ├── components/         # Các React Component tái sử dụng (Timer, ChallengeCard, Navbar, v.v.)
│   └── lib/                # Thư viện tiện ích, Auth helper, Prisma instance & Services
├── tests/                  # Script kiểm thử tự động toàn bộ luồng nghiệp vụ
├── .env                    # Biến môi trường local
├── package.json
└── tsconfig.json
```

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ (Local Setup)

### **1. Yêu cầu tiền đề**
- **Node.js**: phiên bản `>= 18.0.0` (khuyên dùng Node.js 20 LTH)
- **PostgreSQL**: Đã cài đặt và chạy server PostgreSQL cục bộ (hoặc sử dụng PostgreSQL cloud như Supabase, Neon, Railway).

### **2. Cài đặt các bước**

**Bước 1: Clone dự án và cài đặt dependencies**
```bash
git clone <repository-url>
cd 30s-challenge
npm install
```

**Bước 2: Cấu hình biến môi trường**
Tạo file `.env` tại thư mục gốc dự án với nội dung mẫu:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/30schallenge?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Bước 3: Khởi tạo Cơ sở dữ liệu**
Chạy migration hoặc đẩy schema Prisma lên database của bạn:
```bash
npx prisma db push
```

**Bước 4: Nạp dữ liệu mẫu (Seeding)**
Chạy script seed để tạo sẵn thử thách mẫu và tài khoản dùng thử:
```bash
npm run seed
```

*Tài khoản thử nghiệm sau khi seed:*
- 🛡 **Admin**: Username: `admin` | Password: `password123`
- 👤 **User**: Username: `user1` | Password: `password123`

**Bước 5: Khởi chạy Development Server**
```bash
npm run dev
```
Mở trình duyệt và truy cập: `http://localhost:3000`

---

## 🧪 Kiểm thử hệ thống (Automated Verification)

Dự án đi kèm script kiểm thử tự động toàn bộ luồng (Đăng ký, Đăng nhập, Gán thử thách, Làm bài trong 30s, Xử lý hết hạn session, Tính điểm XP & Streak, Trang Admin):

```bash
npx tsx tests/verify-all.ts
```

---

## 🌐 Hướng dẫn Deploy (Deployment Guide)

### **Cách 1: Deploy lên Vercel + Database PostgreSQL Cloud (Khuyên dùng)**

#### **Bước 1: Chuẩn bị Cơ sở dữ liệu Cloud**
Tạo một cơ sở dữ liệu PostgreSQL miễn phí trên một trong các nền tảng:
- **[Neon.tech](https://neon.tech/)**
- **[Supabase](https://supabase.com/)**
- **[Railway](https://railway.app/)**

Lấy chuỗi `DATABASE_URL` kết nối PostgreSQL (nhớ kèm theo tham số SSL nếu có, ví dụ `?sslmode=require`).

#### **Bước 2: Import dự án lên Vercel**
1. Đẩy code của bạn lên GitHub / GitLab / Bitbucket.
2. Truy cập [Vercel Dashboard](https://vercel.com/) -> Thêm dự án mới (**Add New Project**).
3. Chọn Repository `30s-challenge`.

#### **Bước 3: Cấu hình Environment Variables trên Vercel**
Trong mục **Environment Variables** trên Vercel, thêm 3 biến sau:
- `DATABASE_URL`: Đường dẫn kết nối PostgreSQL Cloud của bạn.
- `JWT_SECRET`: Chuỗi bảo mật ngẫu nhiên dài (VD: `prod-secret-key-30s-challenge-xyz...`).
- `NEXT_PUBLIC_APP_URL`: URL tên miền ứng dụng Vercel của bạn (VD: `https://30s-challenge.vercel.app`).

#### **Bước 4: Build & Deploy**
- Vercel sẽ tự động phát hiện Next.js.
- Phần **Build Command** mặc định: `next build` (Prisma Client sẽ tự sinh nhờ postinstall hoặc Prisma integration). Nếu cần đẩy database schema trước khi build, bạn có thể chỉnh Build Command thành:
  ```bash
  npx prisma db push && next build
  ```
- Nhấn **Deploy**. Sau khi hoàn tất, bạn có thể chạy seed dữ liệu lên DB cloud bằng lệnh local:
  ```bash
  DATABASE_URL="your-cloud-db-url" npm run seed
  ```

---

### **Cách 2: Deploy với Docker / VPS Self-Hosted**

#### **1. Tạo file `Dockerfile` trong thư mục gốc:**
```dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push && npm start"]
```

#### **2. Chạy container Docker:**
```bash
docker build -t 30s-challenge .
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NEXT_PUBLIC_APP_URL="http://your-domain.com" \
  --name 30s-challenge-app 30s-challenge
```

---

## 📝 Giấy phép (License)

Dự án được phát triển phục vụ mục đích học tập, thử nghiệm và triển khai sản phẩm. 
Mọi đóng góp và cải tiến đều được hoan nghênh! 🎉
