# QALY BAHA

Hệ thống quản lý bán hàng online dành cho các shop nhỏ lẻ.

## Cấu trúc dự án

```
├── frontend/     # Next.js 14 + Tailwind CSS
├── backend/      # Node.js + Express + MongoDB
└── README.md
```

## Cài đặt

```bash
# Cài đặt tất cả dependencies
npm run install:all

# Chạy development
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
BREVO_API_KEY=your-brevo-api-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
