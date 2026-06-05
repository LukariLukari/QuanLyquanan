/**
 * Bảng dịch trạng thái tiếng Anh -> tiếng Việt
 * Sử dụng: translateStatus('AVAILABLE') => 'Trống'
 */

const STATUS_MAP: Record<string, string> = {
  // Table (Bàn)
  'AVAILABLE': 'Trống',
  'OCCUPIED': 'Đang phục vụ',
  'RESERVED': 'Đã đặt',
  'NEED_CLEANING': 'Cần dọn',

  // Order
  'OPEN': 'Đang mở',
  'PAID': 'Đã thanh toán',
  'CANCELLED': 'Đã hủy',

  // Order Item
  'PENDING': 'Đang chờ',
  'PREPARING': 'Đang chế biến',
  'READY': 'Sẵn sàng',
  'SERVED': 'Đã phục vụ',

  // Staff
  'ACTIVE': 'Đang làm',
  'INACTIVE': 'Tạm nghỉ',
  'LEFT': 'Đã nghỉ',

  // Payroll
  'DRAFT': 'Nháp',
  'LOCKED': 'Đã khóa',

  // Reservation
  'CONFIRMED': 'Đã xác nhận',
  'NO_SHOW': 'Không đến',
  'ARRIVED': 'Đã đến',
  'COMPLETED': 'Hoàn tất',

  // Payment method
  'CASH': 'Tiền mặt',
  'CARD': 'Thẻ',
  'TRANSFER': 'Chuyển khoản',
  'BANK': 'Ngân hàng',
  'E_WALLET': 'Ví điện tử',

  // Menu item
  'OUT_OF_STOCK': 'Hết hàng',

  // Attendance shift
  'MORNING': 'Sáng',
  'AFTERNOON': 'Chiều',
  'EVENING': 'Tối',
  'FULLDAY': 'Cả ngày',
};

export function translateStatus(status: string): string {
  return STATUS_MAP[status] || status;
}
