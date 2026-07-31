"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * `SettingsView` — LuxeOps dark Monolith (Stitch) skin for
 * `/admin/settings`. Mirrors screen
 * `f518a2075e1a4ec6ad5a056e6ed77293` (project 29642013742130547):
 *
 *   - Prominent search bar (bento entry-point).
 *   - Bento grid of grouped settings cards across 7 sections.
 *   - Hover: card border purple + chevron slides in.
 */

interface SettingsCardDef {
  icon: string;
  title: string;
  description: string;
}

interface SettingsSectionDef {
  title: string;
  cards: SettingsCardDef[];
}

const SECTIONS: SettingsSectionDef[] = [
  {
    title: "Chung & Cửa hàng",
    cards: [
      {
        icon: "storefront",
        title: "Thông tin cửa hàng",
        description: "Logo, tên, địa chỉ, hotline",
      },
      {
        icon: "language",
        title: "Ngôn ngữ và khu vực",
        description: "Định dạng thời gian, tiền tệ",
      },
    ],
  },
  {
    title: "Tài chính & Thanh toán",
    cards: [
      {
        icon: "payments",
        title: "Phương thức thanh toán",
        description: "Cấu hình COD, chuyển khoản",
      },
      {
        icon: "account_balance",
        title: "Tài khoản ngân hàng",
        description: "Quản lý số tài khoản nhận tiền",
      },
    ],
  },
  {
    title: "Vận chuyển",
    cards: [
      {
        icon: "local_shipping",
        title: "Đơn vị vận chuyển",
        description: "Giao Hàng Nhanh, GHTK, Viettel Post",
      },
      {
        icon: "price_change",
        title: "Phí vận chuyển",
        description: "Tính phí theo khu vực địa lý",
      },
    ],
  },
  {
    title: "Tích hợp & Kênh bán",
    cards: [
      {
        icon: "forum",
        title: "Tích hợp Messenger",
        description: "Kết nối Fanpage và Chatbot",
      },
      {
        icon: "chat",
        title: "Tích hợp Zalo",
        description: "Cấu hình Zalo OA và Zalo Pay",
      },
      {
        icon: "photo_camera",
        title: "Tích hợp Instagram",
        description: "Đồng bộ bài viết và tin nhắn",
      },
    ],
  },
  {
    title: "Giao diện Storefront",
    cards: [
      {
        icon: "palette",
        title: "Theme và màu sắc",
        description: "Tùy chỉnh giao diện storefront",
      },
      {
        icon: "match_case",
        title: "Font chữ",
        description: "Cấu hình typography hệ thống",
      },
    ],
  },
  {
    title: "Hệ thống & Bảo mật",
    cards: [
      {
        icon: "admin_panel_settings",
        title: "Vai trò và quyền",
        description: "Quản lý nhóm quyền truy cập",
      },
      {
        icon: "badge",
        title: "Nhân viên",
        description: "Danh sách và trạng thái tài khoản",
      },
      {
        icon: "security",
        title: "Bảo mật & 2FA",
        description: "Xác thực 2 lớp và mật khẩu",
      },
      {
        icon: "history",
        title: "Lịch sử đăng nhập",
        description: "Theo dõi thiết bị truy cập",
      },
    ],
  },
  {
    title: "Nâng cao & Developers",
    cards: [
      {
        icon: "plagiarism",
        title: "Audit log",
        description: "Nhật ký thay đổi hệ thống",
      },
      {
        icon: "api",
        title: "API keys",
        description: "Quản lý mã kết nối ứng dụng",
      },
      {
        icon: "analytics",
        title: "Google Analytics",
        description: "Theo dõi lưu lượng và chuyển đổi",
      },
    ],
  },
];

export function SettingsView() {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase();
  const visibleSections = React.useMemo(() => {
    if (!normalized) return SECTIONS;
    return SECTIONS.map((s) => ({
      title: s.title,
      cards: s.cards.filter(
        (c) =>
          c.title.toLowerCase().includes(normalized) ||
          c.description.toLowerCase().includes(normalized),
      ),
    })).filter((s) => s.cards.length > 0);
  }, [normalized]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-8">
      <header>
        <h1 className="mb-1 text-[36px] font-semibold leading-[44px] tracking-[-0.04em] text-foreground">
          Cài đặt
        </h1>
        <p className="text-[14px] leading-[20px] text-muted-foreground">
          Quản lý cấu hình ML Cosmetics Storefront và hệ thống LuxeOps.
        </p>
      </header>

      <div className="relative mb-6 max-w-2xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground" aria-hidden="true">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm cài đặt (VD: Phí vận chuyển, Theme, API)..."
          className="w-full rounded-xl border border-rose-100 bg-surface py-3 pl-12 pr-4 text-[14px] leading-[20px] text-foreground shadow-sm placeholder:text-muted-foreground focus:border-[#e11d74] focus:outline-none focus:ring-1 focus:ring-[#e11d74]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleSections.length === 0 ? (
          <div className="col-span-full rounded-xl border border-rose-100 bg-white p-8 text-center text-[14px] text-muted-foreground">
            Không có cài đặt phù hợp với “{query}”
          </div>
        ) : (
          visibleSections.map((section, idx) => (
            <React.Fragment key={section.title}>
              <SectionHeader title={section.title} first={idx === 0} />
              {section.cards.map((card) => (
                <SettingsCard key={card.title} card={card} />
              ))}
            </React.Fragment>
          ))
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}

function SectionHeader({ title, first }: { title: string; first?: boolean }) {
  return (
    <div
      className={cn(
        "col-span-full border-b border-rose-100 pb-2",
        first ? "mb-2 mt-0" : "mb-2 mt-6",
      )}
    >
      <h3 className="text-[12px] font-medium uppercase leading-[16px] tracking-[0.05em] text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

function SettingsCard({ card }: { card: SettingsCardDef }) {
  return (
    <a
      href="#"
      className={cn(
        "group relative flex flex-col rounded-xl border border-rose-100 bg-white p-4 transition-all",
        "hover:border-[#e11d74]",
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded border border-rose-100 bg-surface transition-colors group-hover:border-[#e11d74]/30">
        <span
          className="material-symbols-outlined text-muted-foreground transition-colors group-hover:text-[#e11d74]"
          aria-hidden="true"
        >
          {card.icon}
        </span>
      </div>
      <h3 className="mb-1 text-[18px] font-semibold leading-[28px] text-foreground">
        {card.title}
      </h3>
      <p className="flex-1 text-[13px] leading-[18px] text-muted-foreground">
        {card.description}
      </p>
      <span
        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-[#e11d74] group-hover:opacity-100"
        aria-hidden="true"
      >
        chevron_right
      </span>
    </a>
  );
}
