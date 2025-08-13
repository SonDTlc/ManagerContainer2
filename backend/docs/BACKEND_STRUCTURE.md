## Tổ chức cấu trúc Backend

### Mục tiêu
Tài liệu mô tả cách tổ chức, quy ước và luồng xử lý trong backend để team phát triển mở rộng và bảo trì nhất quán.

### Cây thư mục tổng quan
```
backend/
├─ main.ts                      # Khởi động server, mount routes
├─ .env                         # Cấu hình môi trường (PORT/JWT/DB...)
├─ logs/                        # Log truy cập/ứng dụng
│  └─ access.log
├─ docs/
│  ├─ USERS_PARTNERS_API.md     # Tài liệu API Users & Partners
│  └─ BACKEND_STRUCTURE.md      # (tài liệu này)
├─ shared/                      # Tài nguyên dùng chung
│  ├─ config/
│  │  └─ database.ts            # Kết nối DB, appConfig (PORT/JWT/Mongo)
│  ├─ middlewares/
│  │  ├─ auth.ts                # JWT, xác thực, sign/verify token
│  │  ├─ rbac.ts                # Phân quyền theo vai (RBAC)
│  │  └─ audit.ts               # Ghi nhật ký (Audit)
│  └─ utils/
│     ├─ passwordPolicy.ts      # Chính sách mật khẩu
│     ├─ pagination.ts          # Tiện ích phân trang
│     └─ csv.ts                 # Xuất CSV
└─ modules/                     # Chia theo domain nghiệp vụ
   ├─ auth/
   │  ├─ controller/
   │  │  ├─ authController.ts
   │  │  └─ authRoutes.ts
   │  ├─ dto/
   │  │  └─ AuthDtos.ts         # Joi schema: login/profile/change-password
   │  ├─ model/                 # (để mở rộng, nếu cần)
   │  ├─ repository/            # (để mở rộng, nếu cần)
   │  └─ service/
   │     └─ AuthService.ts
   ├─ users/
   │  ├─ controller/
   │  │  ├─ userController.ts
   │  │  └─ userRoutes.ts
   │  ├─ dto/
   │  │  └─ UserDtos.ts         # Joi schema: tạo/cập nhật user
   │  ├─ model/
   │  │  └─ User.ts             # RBAC, state machine, scope tenant/partner
   │  ├─ repository/
   │  │  └─ UserRepository.ts
   │  └─ service/
   │     └─ UserService.ts      # Lifecycle: INVITED/ACTIVE/DISABLED/LOCKED
   ├─ customers/
   │  ├─ controller/
   │  │  ├─ customerController.ts
   │  │  └─ customerRoutes.ts
   │  ├─ dto/
   │  │  └─ CustomerDtos.ts     # Joi schema: create/update
   │  ├─ model/
   │  │  └─ Customer.ts         # Unique: tax_code
   │  ├─ repository/
   │  │  └─ CustomerRepository.ts
   │  └─ service/
   │     └─ CustomerService.ts  # Auto-provision CustomerAdmin (INVITED)
   ├─ partners/
   │  ├─ controller/
   │  │  ├─ partnerController.ts
   │  │  └─ partnerRoutes.ts
   │  ├─ dto/
   │  │  └─ PartnerDtos.ts      # Joi schema: create/update
   │  ├─ model/
   │  │  └─ Partner.ts          # Unique: name, trạng thái DRAFT/ACTIVE/INACTIVE
   │  ├─ repository/
   │  │  └─ PartnerRepository.ts
   │  └─ service/
   │     └─ PartnerService.ts   # Activate/Deactivate, Primary admin invite
   └─ audit/
      ├─ controller/
      │  ├─ auditController.ts
      │  └─ auditRoutes.ts      # GET /audit?… (export CSV)
      └─ model/
         └─ AuditLog.ts         # Nhật ký hành động, có thể export
```

### Vai trò từng lớp
- Controller: nhận request/response, validate input (Joi), gọi service, trả HTTP code chuẩn, không chứa business logic.
- Service: chứa quy tắc nghiệp vụ, gọi repository, gọi audit/event khi cần.
- Repository: thao tác DB (Mongoose/Mongo hiện tại).
- Model: định nghĩa schema, index, ràng buộc dữ liệu (unique…).
- DTO: Joi schema để validate payload, giữ cho controller gọn.

### Chuẩn module hóa
- Mỗi domain nằm trong `modules/<domain>/` và đầy đủ 5 nhóm: `controller`, `service`, `repository`, `model`, `dto`.
- Đường dẫn HTTP mount ở `main.ts`:
  - `/auth`, `/users`, `/customers`, `/partners`, `/audit`.
- Áp dụng middleware:
  - `authenticate` trước các route cần JWT.
  - `requireRoles(...)` cho RBAC theo vai.

### Bảo mật, RBAC và Scope
- Vai trò: `SystemAdmin`, `BusinessAdmin`, `HRManager`, `SaleAdmin`, `CustomerAdmin`, `CustomerUser`.
- Scope dữ liệu:
  - `tenant_id`: Customer Admin/User chỉ thấy dữ liệu cùng tenant.
  - `partner_id`: user gắn partner chỉ thấy dữ liệu đối tác.
- RBAC middleware `requireRoles(...)` chặn truy cập trái vai.
- JWT: `shared/middlewares/auth.ts` (sign/verify token, chặn DISABLED/LOCKED).

### State machine tài khoản (Users)
- `INVITED → ACTIVE → DISABLED`
- `ACTIVE → LOCKED → ACTIVE` (unlock)
- Invite có `invite_token`, `invite_expires_at` (7 ngày), audit `USER.INVITED`.

### Audit & Logging
- Audit: `modules/audit` ghi các sự kiện:
  - USER.(INVITED|ENABLED|DISABLED|LOCKED|UNLOCKED|ROLE_CHANGED|UPDATED), CUSTOMER.(CREATED|UPDATED|DISABLED), PARTNER.(CREATED|ACTIVATED|DEACTIVATED), LOGIN_SUCCESS.
- Export CSV: `GET /audit?…&export_type=csv`.
- Access log: `backend/logs/access.log` (morgan ‘combined’) + log console dev.

### Cấu hình & môi trường
- `shared/config/database.ts`: `appConfig` (PORT, JWT, Mongo URI) và `connectDatabase()`.
- `.env` mẫu:
  - `PORT=1000`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/managerContainer?schema=public`
  - `JWT_SECRET=dev-secret`
  - `JWT_EXPIRES_IN=24h`
  - `MONGODB_URI=mongodb://localhost:27017/container_manager`
- Lưu ý: hiện code kết nối MongoDB (Mongoose). Biến `DATABASE_URL` sẵn sàng nếu chuyển sang Postgres sau này.

### Quy ước đặt tên
- Tên file PascalCase cho Model/Service/Controller/Repository (`UserService.ts`).
- Tên DTO có hậu tố `Dtos.ts`.
- Tên routes theo `<domain>Routes.ts`, controller theo `<domain>Controller.ts`.
- Biến/thuộc tính rõ nghĩa, tránh viết tắt.

### Xử lý lỗi
- Controller validate payload (Joi), trả 400 nếu sai.
- Service ném lỗi với thông điệp ngắn gọn; controller map sang HTTP 4xx/5xx.
- Lỗi xác thực: 401/403; không rò rỉ thông tin nhạy cảm.

### Quy trình thêm module mới (Checklist)
- Tạo `modules/<domain>/{model,dto,repository,service,controller}`.
- Xây dựng Joi schema cho input.
- Thêm routes và mount vào `main.ts`.
- Áp dụng `authenticate` và `requireRoles` phù hợp.
- Thêm audit event cho các thao tác quan trọng.
- Viết index/unique trên Model nếu cần.
- Cập nhật tài liệu trong `docs/`.

### Luồng request chuẩn
Client → Route → `authenticate` (nếu cần) → `requireRoles` (nếu cần) → Controller (validate) → Service (business) → Repository (DB) → Audit (ghi sự kiện) → Controller trả JSON/CSV.

### Khởi chạy
- Backend (port 1000):
  - `cd backend`
  - `npm i`
  - `npm run dev`
- Healthcheck: `GET /health`

### Bản đồ mã nguồn theo module (Code map)

Để thuận tiện bảo trì, dưới đây là danh sách file tương ứng theo từng module/chức năng.

#### Module 2 — Auth & Account
- Controller/Routes:
  - `modules/auth/controller/authController.ts`
  - `modules/auth/controller/authRoutes.ts`
- Service/Logic:
  - `modules/auth/service/AuthService.ts`
  - `modules/auth/service/TokenService.ts`
  - `modules/auth/service/MfaService.ts`
- DTO/Validation:
  - `modules/auth/dto/AuthDtos.ts`
- Tài liệu:
  - `docs/MODULE_2_AUTH.md`

#### Module Users (US 1.1)
- Controller/Routes:
  - `modules/users/controller/userController.ts`
  - `modules/users/controller/userRoutes.ts`
- Service/Repository:
  - `modules/users/service/UserService.ts`
  - `modules/users/repository/UserRepository.ts`
- DTO/Validation:
  - `modules/users/dto/UserDtos.ts`
- Model (đã chuyển Prisma; file cũ để tham chiếu):
  - `modules/users/model/User.ts`

#### Module Customers (US 1.2)
- Controller/Routes:
  - `modules/customers/controller/customerController.ts`
  - `modules/customers/controller/customerRoutes.ts`
- Service/Repository:
  - `modules/customers/service/CustomerService.ts`
  - `modules/customers/repository/CustomerRepository.ts`
- DTO/Validation:
  - `modules/customers/dto/CustomerDtos.ts`
- Model (chuyển Prisma; file cũ để tham chiếu):
  - `modules/customers/model/Customer.ts`

#### Module Partners (US 9.2)
- Controller/Routes:
  - `modules/partners/controller/partnerController.ts`
  - `modules/partners/controller/partnerRoutes.ts`
- Service/Repository:
  - `modules/partners/service/PartnerService.ts`
  - `modules/partners/repository/PartnerRepository.ts`
- DTO/Validation:
  - `modules/partners/dto/PartnerDtos.ts`
- Model (chuyển Prisma; file cũ để tham chiếu):
  - `modules/partners/model/Partner.ts`

#### Module Audit (US 8.5)
- Controller/Routes:
  - `modules/audit/controller/auditController.ts`
  - `modules/audit/controller/auditRoutes.ts`
- Ghi nhật ký dùng:
  - `shared/middlewares/audit.ts` (ghi vào Prisma `AuditLog`)
- Model (tham chiếu cũ):
  - `modules/audit/model/AuditLog.ts`

#### Shared/Common
- Cấu hình DB & Prisma:
  - `shared/config/database.ts`
- Middlewares:
  - `shared/middlewares/auth.ts` (JWT)
  - `shared/middlewares/rbac.ts` (RBAC/Scope)
  - `shared/middlewares/audit.ts` (Audit helper)
- Utils:
  - `shared/utils/passwordPolicy.ts`
  - `shared/utils/pagination.ts`
  - `shared/utils/csv.ts`

#### Server bootstrap
- `main.ts` (mount routes, middleware, logging)

#### Prisma (PostgreSQL)
- Schema & migrations: `prisma/schema.prisma`
- Seed: `prisma/seed.ts`

#### Frontend (tham chiếu test Module 2 & Users)
- API client & refresh:
  - `frontend/services/api.ts`
  - `frontend/services/auth.ts`
- Trang:
  - `frontend/pages/Login/index.tsx`
  - `frontend/pages/Register/index.tsx`
  - `frontend/pages/Account/index.tsx`
  - `frontend/pages/UsersPartners/index.tsx`
- RBAC helper:
  - `frontend/utils/rbac.ts`
