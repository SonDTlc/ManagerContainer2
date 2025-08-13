# Module 3 — Quản lý Yêu cầu Dịch vụ & Chứng từ

Mục tiêu: quản lý vòng đời yêu cầu dịch vụ container (tạo → xử lý → hoàn tất), và quản lý chứng từ (EIR/LOLO/Hóa đơn) kèm version. Phân quyền: Customer (Admin/User), SaleAdmin, Accountant.

## 1) Data model (Prisma)
- `ServiceRequest(id, tenant_id, created_by, type, container_no, eta, status, history, createdAt, updatedAt)`
- `DocumentFile(id, request_id, type, name, size, version, uploader_id, storage_key, createdAt, deleted_at?, deleted_by?, delete_reason?)`
- `PaymentRequest(id, request_id, created_by, status, createdAt)`

Status: PENDING | RECEIVED | REJECTED | COMPLETED | EXPORTED | IN_YARD | LEFT_YARD

## 2) RBAC
- CustomerAdmin/CustomerUser: tạo/list yêu cầu trong tenant; xem chứng từ của tenant.
- SaleAdmin: nhận/từ chối yêu cầu; tạo mới thay khách; upload/xóa EIR/LOLO; gửi yêu cầu thanh toán.
- Accountant: upload/xóa INVOICE; xem requests/docs.

## 3) API
Base: `/requests` (JWT)

### 3.1. Tạo yêu cầu
- Customer (tạo):
  - `POST /requests`
  - Body: `{ type: 'IMPORT'|'EXPORT'|'CONVERT', container_no, eta? }`
  - 201 → Request PENDING
- SaleAdmin (tạo thay khách):
  - `POST /requests` (role=SaleAdmin) → status `RECEIVED`

### 3.2. Danh sách/Tra cứu
- `GET /requests?type=&status=&page=&limit=`
  - Customer: auto filter theo tenant_id
  - SaleAdmin/Accountant: xem tất cả

### 3.3. Cập nhật trạng thái (Depot)
- `PATCH /requests/:id/status`
  - Body: `{ status: 'RECEIVED'|'REJECTED'|'COMPLETED'|'EXPORTED', reason? }`
  - RBAC: SaleAdmin
  - Luồng trạng thái hợp lệ (state machine):
    - `PENDING → RECEIVED | REJECTED`
    - `RECEIVED → COMPLETED | EXPORTED | REJECTED | IN_YARD`
    - `COMPLETED → EXPORTED | IN_YARD`
    - `IN_YARD → LEFT_YARD`
    - `LEFT_YARD`/`EXPORTED`/`REJECTED` là trạng thái cuối (không chuyển tiếp)
  - Yêu cầu nhập `reason` khi chuyển sang `REJECTED`

### 3.4. Chứng từ
- Upload (AC1/AC5):
  - `POST /requests/:id/docs` (multipart: `file`, body: `{ type: 'EIR'|'LOLO'|'INVOICE' }`)
  - Chỉ khi status ∈ { COMPLETED, EXPORTED }
  - Mimetype: pdf/jpeg/png, size ≤ 10MB → version tăng tự động (v1, v2, ...)
  - RBAC: EIR/LOLO (SaleAdmin), INVOICE (Accountant)
- Danh sách:
  - `GET /requests/:id/docs`
  - RBAC: SaleAdmin/Accountant/Customer* (tenant scope)
- Xóa (AC4):
  - `DELETE /requests/:id/docs/:docId` (Body: `{reason}` optional)
  - RBAC: người upload, hoặc SystemAdmin/BusinessAdmin/SaleAdmin/Accountant
  - Soft-delete: lưu `deleted_at/by/reason`; audit

### 3.5. Yêu cầu thanh toán (US 3.4)
- `POST /requests/:id/payment-request` (SaleAdmin)
  - Chỉ cho phép khi `status = COMPLETED`
  - Trả `PaymentRequest` status `SENT` → Accountant tiếp nhận (luồng tiếp theo sẽ mở rộng)

## 4) Lưu trữ file
- Demo: lưu local tại `backend/uploads/` với tên `{timestamp}_{original}` (cấu hình trong `RequestRoutes.ts`).
- Sản phẩm: thay bằng S3/Azure Blob + signed URL.

## 5) Audit
- `REQUEST.CREATED|RECEIVED|REJECTED|COMPLETED|EXPORTED`
- `DOC.UPLOADED|DOC.DELETED`
- `PAYMENT.SENT`

## 6) FE gợi ý
- Trang khách hàng (Customer*): form tạo yêu cầu + list; filter theo trạng thái.
- Trang depot (SaleAdmin): bảng requests với action nhận/từ chối; tab docs; nút “Gửi yêu cầu thanh toán”.

## 7) Bản đồ mã nguồn Module 3
- DTO: `modules/requests/dto/RequestDtos.ts`
- Repository: `modules/requests/repository/RequestRepository.ts`
- Service: `modules/requests/service/RequestService.ts`
- Controller: `modules/requests/controller/RequestController.ts`
- Routes: `modules/requests/controller/RequestRoutes.ts`
- Prisma: `prisma/schema.prisma` (ServiceRequest, DocumentFile, PaymentRequest)

## 8) TODO tiếp theo
- Notification service (email/webpush) khi tạo/nhận/từ chối.
- Viewer file (PDF.js/Lightbox) + signed URL.
- Accountant xử lý PaymentRequest (RECEIVED/PAID/REJECTED) + xuất hóa đơn.
- Reuse COS: thêm endpoint redirect với prefill.

## 9) References & Liên kết module

### 9.1. Liên kết với Module 1 — Quản lý Người dùng & Đối tác
- ServiceRequest lưu `tenant_id` để áp scope theo khách hàng.
- Người tạo/duyệt request là user trong Module 1: `created_by` ↔ user_id.
- RBAC kế thừa từ Module 1 (vai trò: CustomerAdmin/CustomerUser, SaleAdmin, Accountant).
- Khi SaleAdmin tạo user khách hoặc CustomerAdmin mời user, họ có thể truy cập Module 3 theo scope tenant.

### 9.2. Liên kết với Module 2 — Auth & Account
- JWT chứa `role`, `tenant_id` được sử dụng để filter và kiểm tra quyền cho tất cả API của Module 3.
- Audit log dùng middleware chung `shared/middlewares/audit.ts` như Module 2.
- Người dùng đăng nhập/đổi mật khẩu/accept-invite ở Module 2 trước khi thao tác yêu cầu dịch vụ.

### 9.3. Liên kết Module 4 — Gate Management
- Gate IN/OUT sử dụng các trạng thái `IN_YARD` và `LEFT_YARD` được mô tả ở Module 4.

### 9.4. Bảng phân quyền (RBAC) tóm tắt cho Module 3

| Tác vụ                                    | CustomerAdmin | CustomerUser | SaleAdmin | Accountant |
|-------------------------------------------|---------------|--------------|----------:|-----------:|
| Tạo yêu cầu (POST /requests)              | ✅ (tenant)    | ✅ (tenant)   | ✅         | ❌          |
| Danh sách yêu cầu (GET /requests)         | ✅ (tenant)    | ✅ (tenant)   | ✅         | ✅          |
| Cập nhật trạng thái (PATCH /:id/status)   | ❌             | ❌            | ✅         | ❌          |
| Upload EIR/LOLO (POST /:id/docs)          | ❌             | ❌            | ✅         | ❌          |
| Upload INVOICE (POST /:id/docs)           | ❌             | ❌            | ❌         | ✅          |
| Xem chứng từ (GET /:id/docs)              | ✅ (tenant)    | ✅ (tenant)   | ✅         | ✅          |
| Xóa chứng từ (DELETE /:id/docs/:docId)    | ❌ (trừ uploader) | ❌         | ✅         | ✅          |
| Gửi yêu cầu thanh toán (POST /:id/payment-request) | ❌ | ❌ | ✅ | ❌ |

Ghi chú:
- “(tenant)” nghĩa là chỉ trong tenant của user, áp dụng qua `tenant_id` trong JWT.
- Xóa chứng từ: người upload xóa được; hoặc vai trò cao hơn (SystemAdmin/BusinessAdmin/SaleAdmin/Accountant).
