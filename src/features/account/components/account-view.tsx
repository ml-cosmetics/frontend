"use client";

import * as React from "react";
import {
  Calendar,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";
import { useAccountActivity, useAccountProfile, useUpdateAccountProfile } from "../hooks";
import { getGenderLabel, getLanguageLabel, getTimeFormatLabel } from "../utils/labels";
import type { AccountProfile } from "@/types";

type SettingsTab = "info" | "security" | "notifications" | "sessions";

/**
 * Hồ sơ cá nhân — the LuxeOps operator profile surface.
 *
 * Composition:
 *   - Left column (1/3):
 *       - Profile card (avatar, name, badge, contact lines,
 *         upload / remove actions, handled orders / reviews stat row)
 *       - Recent activity card
 *   - Right column (2/3):
 *       - Settings tabs (info / security / notifications / sessions)
 *       - Personal info form (basic fields + locale + address)
 *       - Form footer (Hủy / Lưu thay đổi)
 *
 * The form holds a local `draft` that's seeded from the loaded
 * profile. `Lưu thay đổi` flushes the diff through the
 * `useUpdateAccountProfile` mutation.
 */
export function AccountView() {
  const profileQuery = useAccountProfile();
  const activityQuery = useAccountActivity();
  const updateProfile = useUpdateAccountProfile();

  const [tab, setTab] = React.useState<SettingsTab>("info");
  const [draft, setDraft] = React.useState<AccountProfile | null>(null);

  React.useEffect(() => {
    if (profileQuery.data && !draft) {
      setDraft(profileQuery.data);
    }
  }, [profileQuery.data, draft]);

  const handleField = React.useCallback(
    <K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) => {
      setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  const handleAddress = React.useCallback(
    (key: keyof NonNullable<AccountProfile["address"]>, value: string) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = { ...(prev.address ?? {}) };
        next[key] = value;
        return { ...prev, address: next };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!draft) return;
      updateProfile.mutate({
        full_name: draft.full_name,
        email: draft.email,
        phone: draft.phone,
        date_of_birth: draft.date_of_birth ?? null,
        gender: draft.gender ?? null,
        bio: draft.bio ?? null,
        language: draft.language,
        timezone: draft.timezone,
        time_format: draft.time_format,
        address: draft.address ?? null,
      });
    },
    [draft, updateProfile],
  );

  const handleCancel = React.useCallback(() => {
    setDraft(profileQuery.data ?? null);
  }, [profileQuery.data]);

  const profile = draft;
  const isSaving = updateProfile.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[18px] font-semibold leading-[28px] text-foreground">
          Hồ sơ cá nhân
        </h1>
        <p className="text-[13px] leading-[18px] text-muted-foreground">
          Quản lý thông tin và cài đặt tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <ProfileCard
            profile={profile}
            loading={profileQuery.isLoading}
            onUpload={() => undefined}
            onRemove={() => undefined}
          />
          <RecentActivityCard
            activity={activityQuery.data}
            loading={activityQuery.isLoading}
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-8">
          <SettingsTabs active={tab} onChange={setTab} />

          <form
            onSubmit={handleSubmit}
            className="flex flex-col overflow-hidden rounded-lg border border-rose-100 bg-white"
          >
            <div className="flex flex-col gap-6 p-6">
              {tab === "info" ? (
                <PersonalInfoFields
                  profile={profile}
                  onField={handleField}
                  onAddress={handleAddress}
                  loading={profileQuery.isLoading}
                />
              ) : tab === "security" ? (
                <PlaceholderTab
                  title="Bảo mật"
                  description="Đổi mật khẩu, bật 2FA, và quản lý thiết bị tin cậy. Sắp ra mắt."
                />
              ) : tab === "notifications" ? (
                <PlaceholderTab
                  title="Thông báo"
                  description="Tuỳ chỉnh kênh nhận thông báo (email, web, mobile). Sắp ra mắt."
                />
              ) : (
                <PlaceholderTab
                  title="Phiên đăng nhập"
                  description="Theo dõi và thu hồi phiên đăng nhập đang hoạt động. Sắp ra mắt."
                />
              )}
            </div>
            {tab === "info" && (
              <div className="flex items-center justify-end gap-3 border-t border-rose-100 bg-surface p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving || !profile}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !profile}
                  aria-label="Lưu thay đổi hồ sơ"
                >
                  {isSaving && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  <span>Lưu thay đổi</span>
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Profile card
 * ------------------------------------------------------------------ */

interface ProfileCardProps {
  profile: AccountProfile | null;
  loading?: boolean;
  onUpload: () => void;
  onRemove: () => void;
}

function ProfileCard({ profile, loading, onUpload, onRemove }: ProfileCardProps) {
  const initials = (profile?.full_name ?? "ML")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-rose-100 bg-white p-6 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#e11d74] to-[#9f1239] text-[24px] font-bold text-[#09090b] ring-4 ring-[#09090b] shadow-[0_0_20px_rgba(225,29,116,0.15)]"
        aria-hidden="true"
      >
        {initials || "ML"}
      </div>
      {loading || !profile ? (
        <Skeleton className="h-5 w-32" />
      ) : (
        <h2 className="flex items-center gap-2 text-[18px] font-semibold leading-[28px] text-foreground">
          {profile.full_name}
          <span className="rounded-full border border-[#e11d74] bg-[#e11d74]/10 px-2 py-0.5 font-mono text-[10px] font-medium text-[#e11d74]">
            {profile.role_label}
          </span>
        </h2>
      )}
      <div className="flex w-full flex-col gap-2 border-t border-rose-100 pt-4 text-left text-[13px] text-muted-foreground">
        <ContactLine icon={Mail} value={profile?.email} loading={loading} />
        <ContactLine icon={Phone} value={profile?.phone} loading={loading} />
        <ContactLine
          icon={Calendar}
          value={
            profile
              ? `Tham gia: ${formatDate(profile.joined_at)}`
              : undefined
          }
          loading={loading}
        />
      </div>
      <div className="grid w-full grid-cols-2 gap-px overflow-hidden rounded border border-rose-100 bg-surface-container-high">
        <div className="flex flex-col items-center bg-white p-4">
          {loading || !profile ? (
            <Skeleton className="h-5 w-12" />
          ) : (
            <span className="font-mono text-[18px] font-semibold text-foreground">
              {profile.stats.orders_handled}
            </span>
          )}
          <span className="mt-1 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Đơn đã xử lý
          </span>
        </div>
        <div className="flex flex-col items-center bg-white p-4">
          {loading || !profile ? (
            <Skeleton className="h-5 w-12" />
          ) : (
            <span className="font-mono text-[18px] font-semibold text-foreground">
              {profile.stats.reviews}
            </span>
          )}
          <span className="mt-1 text-center text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Đánh giá
          </span>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onUpload}
          aria-label="Tải ảnh đại diện lên"
        >
          Tải ảnh lên
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          className="text-[#f87171] hover:bg-[#7f1d1d]/10"
          aria-label="Xóa ảnh đại diện"
        >
          Xóa ảnh
        </Button>
      </div>
    </div>
  );
}

function ContactLine({
  icon: Icon,
  value,
  loading,
}: {
  icon: typeof Mail;
  value: string | undefined;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <span className="truncate">{value ?? "—"}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Recent activity card
 * ------------------------------------------------------------------ */

function RecentActivityCard({
  activity,
  loading,
}: {
  activity: ReturnType<typeof useAccountActivity>["data"];
  loading?: boolean;
}) {
  return (
    <section className="flex flex-col rounded-lg border border-rose-100 bg-white">
      <div className="border-b border-rose-100 p-4">
        <h3 className="text-[14px] font-semibold text-foreground">
          Hoạt động gần đây
        </h3>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {loading || !activity ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : activity.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Chưa có hoạt động nào.</p>
        ) : (
          activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#494552]"
                aria-hidden="true"
              />
              <div>
                <p className="text-[13px] leading-[18px] text-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                  {formatDate(item.occurred_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Settings tabs
 * ------------------------------------------------------------------ */

const TABS: Array<{ value: SettingsTab; label: string }> = [
  { value: "info", label: "Thông tin cá nhân" },
  { value: "security", label: "Bảo mật" },
  { value: "notifications", label: "Thông báo" },
  { value: "sessions", label: "Phiên đăng nhập" },
];

function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTab;
  onChange: (next: SettingsTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Cài đặt hồ sơ"
      className="flex gap-6 border-b border-rose-100"
    >
      {TABS.map((t) => {
        const isActive = active === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.value)}
            className={cn(
              "border-b-2 pb-3 text-[13px] font-medium transition-colors",
              isActive
                ? "border-[#e11d74] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Info fields
 * ------------------------------------------------------------------ */

interface PersonalInfoFieldsProps {
  profile: AccountProfile | null;
  loading?: boolean;
  onField: <K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) => void;
  onAddress: (key: keyof NonNullable<AccountProfile["address"]>, value: string) => void;
}

function PersonalInfoFields({
  profile,
  loading,
  onField,
  onAddress,
}: PersonalInfoFieldsProps) {
  if (loading || !profile) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  return (
    <>
      <section>
        <h3 className="mb-3 text-[14px] font-semibold text-foreground">
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            id="full_name"
            label="Họ và tên"
            value={profile.full_name}
            onChange={(v) => onField("full_name", v)}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={profile.email}
            onChange={(v) => onField("email", v)}
          />
          <Field
            id="phone"
            label="Số điện thoại"
            value={profile.phone}
            onChange={(v) => onField("phone", v)}
          />
          <Field
            id="dob"
            label="Ngày sinh"
            type="date"
            value={profile.date_of_birth ?? ""}
            onChange={(v) => onField("date_of_birth", v || null)}
          />
          <SelectField
            id="gender"
            label="Giới tính"
            value={profile.gender ?? ""}
            onChange={(v) =>
              onField("gender", (v ? (v as AccountProfile["gender"]) : null) as AccountProfile["gender"])
            }
            options={[
              { value: "female", label: getGenderLabel("female") },
              { value: "male", label: getGenderLabel("male") },
              { value: "other", label: getGenderLabel("other") },
            ]}
          />
        </div>
        <div className="mt-4">
          <label
            htmlFor="bio"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
          >
            Tiểu sử
          </label>
          <textarea
            id="bio"
            value={profile.bio ?? ""}
            onChange={(e) => onField("bio", e.target.value || null)}
            placeholder="Giới thiệu ngắn về bạn..."
            rows={3}
            className="mt-1 w-full resize-none rounded border border-rose-100 bg-surface px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-[#e11d74] focus:outline-none focus:ring-1 focus:ring-[#e11d74]"
          />
        </div>
      </section>

      <hr className="border-rose-100" />

      <section>
        <h3 className="mb-3 text-[14px] font-semibold text-foreground">
          Khu vực & Ngôn ngữ
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField
            id="language"
            label="Ngôn ngữ"
            value={profile.language}
            onChange={(v) => onField("language", v as AccountProfile["language"])}
            options={[
              { value: "vi", label: getLanguageLabel("vi") },
              { value: "en", label: getLanguageLabel("en") },
            ]}
          />
          <SelectField
            id="timezone"
            label="Múi giờ"
            value={profile.timezone}
            onChange={(v) => onField("timezone", v)}
            options={[
              {
                value: "Asia/Ho_Chi_Minh",
                label: "(GMT+07:00) Indochina Time (Ho Chi Minh)",
              },
            ]}
          />
          <SelectField
            id="time_format"
            label="Định dạng hiển thị"
            value={profile.time_format}
            onChange={(v) => onField("time_format", v as AccountProfile["time_format"])}
            options={[
              { value: "24h", label: getTimeFormatLabel("24h") },
              { value: "12h", label: getTimeFormatLabel("12h") },
            ]}
          />
        </div>
      </section>

      <hr className="border-rose-100" />

      <section>
        <h3 className="mb-3 text-[14px] font-semibold text-foreground">Địa chỉ</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <Field
            id="house_number"
            label="Số nhà"
            value={profile.address?.house_number ?? ""}
            onChange={(v) => onAddress("house_number", v)}
            wrapperClassName="md:col-span-3"
          />
          <Field
            id="street"
            label="Đường"
            value={profile.address?.street ?? ""}
            onChange={(v) => onAddress("street", v)}
            wrapperClassName="md:col-span-9"
          />
          <Field
            id="ward"
            label="Phường/Xã"
            value={profile.address?.ward ?? ""}
            onChange={(v) => onAddress("ward", v)}
            wrapperClassName="md:col-span-4"
          />
          <Field
            id="district"
            label="Quận/Huyện"
            value={profile.address?.district ?? ""}
            onChange={(v) => onAddress("district", v)}
            wrapperClassName="md:col-span-4"
          />
          <Field
            id="province"
            label="Tỉnh/Thành"
            value={profile.address?.province ?? ""}
            onChange={(v) => onAddress("province", v)}
            wrapperClassName="md:col-span-4"
          />
        </div>
      </section>
    </>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  wrapperClassName?: string;
}

function Field({ id, label, value, onChange, type = "text", wrapperClassName }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <label
        htmlFor={id}
        className="font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface"
      />
    </div>
  );
}

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  wrapperClassName?: string;
}

function SelectField({ id, label, value, onChange, options, wrapperClassName }: SelectFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <label
        htmlFor={id}
        className="font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded border border-rose-100 bg-surface px-3 text-[14px] text-foreground focus:border-[#e11d74] focus:outline-none focus:ring-1 focus:ring-[#e11d74]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
        <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-[13px] leading-[18px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
