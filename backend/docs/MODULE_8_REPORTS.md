# Module 8 — Báo cáo & Thống kê (Reporting & Analytics)

Tài liệu triển khai dựa trên kiến trúc và phân quyền sẵn có trong hệ thống.

## 1. Phạm vi & RBAC
- Roles được phép: `SystemAdmin`, `BusinessAdmin`, `SaleAdmin`, `Accountant`.
- Phạm vi dữ liệu theo role:
  - SystemAdmin/BusinessAdmin: toàn hệ thống.
  - SaleAdmin: ưu tiên lọc theo `customer_id` (khi có).
  - Accountant: dữ liệu tài chính và KPI tổng hợp.

## 2. Endpoints
- `GET /reports/dashboard?from&to&customer_id` — Trả KPI tổng quan:
  - `revenue_by_day`, `payments_by_day`, `requests_status`, `yard_utilization`, `forklift_productivity`, `ar_aging`.
- `POST /reports/custom/preview` — Body `{ type, filters }` để xem nhanh một loại báo cáo.
- `POST /reports/export` — Body `{ type, format: 'csv'|'pdf', filename?, filters }` để xuất file.

## 3. Kỹ thuật
- Repository dùng Prisma aggregate cho các bảng có sẵn: `Invoice`, `Payment`, `ServiceRequest`, `YardSlot`, `ForkliftTask`.
- Cache in-memory TTL 120s (`modules/reports/service/Cache.ts`). Có thể chuyển sang Redis về sau.
- Export hỗ trợ CSV (csv-stringify) và PDF (pdfkit).

## 4. Liên kết module
- M3 Requests → `requests_status`.
- M4 Gate → (TAT sẽ bổ sung ở phase sau).
- M5 Yard → `yard_utilization`.
- M6 Maintenance → (chưa tổng hợp, có thể thêm báo cáo chi phí vật tư).
- M7 Finance → `revenue_by_day`, `payments_by_day`, `ar_aging`.

## 5. Ví dụ gọi API
```bash
# Dashboard
curl -H "Authorization: Bearer <token>" "http://localhost:1000/reports/dashboard?from=2025-08-01&to=2025-08-31"

# Preview report
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"type":"revenue_by_day","filters":{"from":"2025-08-01","to":"2025-08-31"}}' \
  http://localhost:1000/reports/custom/preview

# Export CSV
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"type":"ar_aging","format":"csv","filename":"ar_aging_aug","filters":{}}' \
  http://localhost:1000/reports/export -o ar_aging_aug.csv
```

## 7. Frontend integration
- Trang `frontend/pages/Reports/index.tsx` cung cấp:
  - Bộ lọc ngày và `customer_id`.
  - Bảng Revenue/Payments theo ngày, Requests status, Yard utilization, Forklift productivity, AR aging.
  - Nút Export CSV/PDF.
- Header thêm nút `Reports` để điều hướng nhanh.

## 6. Ghi chú mở rộng
- Có thể thay cache in-memory bằng Redis (ioredis) và thêm BullMQ worker để refresh định kỳ Materialized Views.
- Khi thêm MV, nên đặt tên: `mv_daily_revenue`, `mv_gate_turnaround`, `mv_yard_utilization`, `mv_requests_status`, `mv_forklift_productivity`, `mv_ar_aging`.
- Với dataset lớn, cân nhắc thêm index theo các cột: `Invoice(issue_date,status,customer_id)`, `Payment(paid_date,customer_id)`, `ServiceRequest(createdAt,status)`.


