import * as React from "react";
import Link from "next/link";
import { cn, resolveImageUrl } from "@/lib/utils";
import {
  ArrowForward,
  AutoAwesome,
  FormatQuote,
  Groups,
  Shield,
  SupportAgent,
  Verified,
} from "@/components/layout/storefront-icons";
import { Button } from "@/components/ui/button";

/**
 * AboutStitchView — Stitch layout for `/about`.
 *
 * Mirrors the "Về ML Cosmetics - Aura Rose Collection" canvas:
 *   1. Hero (eyebrow + Playfair italic headline + body + ✨ glyph).
 *   2. Founder card — Mỹ Lệ (single founder, young woman running the
 *      brand). Image is the brand owner's portrait with a floating
 *      favorite badge + bio + blockquote.
 *   3. Timeline (5 milestones: 2021 / 2023 / 2024 / 2025 / Hiện Tại
 *      with an animated primary ring on the active node).
 *   4. Core values (4 cards with hover lift).
 *   5. Craft story (3 alternating image/text process steps using the
 *      owner's studio photography).
 *   6. Stats strip (4 numbers).
 *   7. CTA strip.
 *
 * The "team grid" was intentionally removed — Mỹ Lệ is the sole
 * founder. The page is therefore a founder-driven brand story.
 *
 * Server-rendered. The footer + marquee already come from
 * `PublicShell`, so this view contains only the content area.
 */
export interface AboutStitchViewProps {
  /** Optional override for the brand wordmark. Defaults to "ML Cosmetics". */
  className?: string;
}

// Founder portrait (Mỹ Lệ) — supplied by the brand owner.
const HERO_IMAGE =
  "http://localhost:9000/mlc-media/uploads/2026/07/1785056724_d8231e521a1d128a";
const FOUNDER_IMAGE =
  "http://localhost:9000/mlc-media/uploads/2026/07/1785056759_d472271c3120520d";
const CRAFT_IMAGE =
  "http://localhost:9000/mlc-media/uploads/2026/07/1785056777_1cd1b9ba950a3dec";

interface TimelineNode {
  year: string;
  title: string;
  body: string;
  highlight?: boolean;
}

const TIMELINE: TimelineNode[] = [
  {
    year: "2021",
    title: "Khởi Nguồn",
    body: "Đam mê ngọc cẩm thạch & viên gạch đầu tiên.",
  },
  {
    year: "2023",
    title: "Mở Rộng",
    body: "Hợp tác phân phối Dior & mỹ phẩm cao cấp.",
  },
  {
    year: "2024",
    title: "Cột Mốc",
    body: "Phục vụ hơn 1,000+ khách hàng tinh hoa.",
  },
  {
    year: "2025",
    title: "Showroom",
    body: "Khai trương không gian trưng bày tại Hà Nội.",
  },
  {
    year: "Hiện Tại",
    title: "Hiện Tại",
    body: "Cùng bạn viết tiếp câu chuyện rực rỡ.",
    highlight: true,
  },
];

interface Value {
  title: string;
  body: string;
  icon: React.ReactNode;
}

const VALUES: Value[] = [
  {
    title: "Chân Thật",
    body: "Cam kết 100% ngọc tự nhiên loại A, minh bạch nguồn gốc và chất lượng.",
    icon: <Verified size={32} className="text-3xl" />,
  },
  {
    title: "Tư Vấn 1:1",
    body: "Lắng nghe và tư vấn chuyên sâu, chọn trang sức phù hợp phong thủy bản mệnh.",
    icon: <SupportAgent size={32} className="text-3xl" />,
  },
  {
    title: "Bảo Hành Trọn Đời",
    body: "Đồng hành cùng vẻ đẹp của bạn với chính sách đánh bóng, làm mới vĩnh viễn.",
    icon: <Shield size={32} className="text-3xl" />,
  },
  {
    title: "Cộng Đồng",
    body: "Xây dựng cộng đồng phụ nữ yêu cái đẹp, thanh lịch, khí chất và tự tin.",
    icon: <Groups size={32} className="text-3xl" />,
  },
];

interface CraftStep {
  index: string;
  title: string;
  body: string;
  image: string;
}

const CRAFT_STEPS: CraftStep[] = [
  {
    index: "01",
    title: "Tuyển chọn ngọc Myanmar thủ công",
    body: "Mỗi khối ngọc thô được tuyển chọn gắt gao từ những mỏ đá quý trứ danh tại Myanmar. Đội ngũ chuyên gia của chúng tôi trực tiếp kiểm định nước ngọc, vân đá và độ trong suốt để đảm bảo chỉ những viên ngọc cực phẩm mới được đưa vào chế tác.",
    image: CRAFT_IMAGE,
  },
  {
    index: "02",
    title: "Chứng nhận GRA quốc tế",
    body: "Sự minh bạch là tôn chỉ. Mọi sản phẩm ngọc và trang sức cao cấp tại ML Cosmetics đều trải qua quá trình giám định độc lập khắt khe và đi kèm chứng nhận quốc tế GRA, bảo chứng tuyệt đối cho giá trị đầu tư của bạn.",
    image: HERO_IMAGE,
  },
  {
    index: "03",
    title: "Đóng gói quà sang trọng",
    body: "Khoảnh khắc mở hộp ML Cosmetics phải là một trải nghiệm đáng nhớ. Lớp nhung trắng mềm mại, dải ruy băng lụa hồng pastel tinh tế, tất cả được chuẩn bị tỉ mỉ để tôn vinh món quà dành tặng chính mình hay những người thân yêu.",
    image: FOUNDER_IMAGE,
  },
];

export function AboutStitchView({ className }: AboutStitchViewProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <Hero />
      {/* Per request, the page currently only renders the hero ("Câu
          chuyện ML Cosmetics" eyebrow + "Hành trình của nét đẹp"
          headline). All other sections are temporarily hidden —
          uncomment to re-enable. */}
      {/* <FounderSection /> */}
      {/* <TimelineSection /> */}
      {/* <ValuesSection /> */}
      {/* <CraftStorySection /> */}
      {/* <StatsStrip /> */}
      {/* <CtaStrip /> */}
    </div>
  );
}

AboutStitchView.displayName = "AboutStitchView";

/* ----------------------------------------------------------------------- *
 * Hero
 * ----------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-rose-50/40 px-6 py-24 md:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-rose-100/60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-rose-100/40 blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
        <span className="text-primary mb-2 block text-xs font-semibold uppercase tracking-widest">
          Câu chuyện ML Cosmetics
        </span>
        <h1 className="sparkle-text font-headline text-4xl italic leading-tight text-zinc-900 md:text-5xl lg:text-6xl">
          Hành trình của nét đẹp
          <br />
          <span className="text-primary font-normal">
            — Từ đá ngọc đến nụ cười
          </span>
        </h1>
        <p className="font-body mx-auto max-w-2xl text-lg font-light leading-relaxed text-zinc-600 md:text-xl">
          Mỗi tác phẩm tại ML Cosmetics không chỉ là trang sức, mà là một
          lời thì thầm của thời gian. Bắt nguồn từ niềm đam mê mãnh liệt
          của người sáng lập Mỹ Lệ vào năm 2021, chúng tôi tin rằng vẻ
          đẹp thực sự đến từ sự kết nối giữa năng lượng tự nhiên và khí
          chất người phụ nữ.
        </p>
        <div className="pt-8">
          <AutoAwesome
            size={48}
            className="text-primary/50 text-4xl"
          />
        </div>
      </div>
    </section>
  );
}

Hero.displayName = "Hero";

/* ----------------------------------------------------------------------- *
 * Founder
 * ----------------------------------------------------------------------- */

function FounderSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:px-12">
      <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-[20px] border border-rose-50 bg-white p-8 shadow-xl md:flex-row md:p-12">
        <div
          aria-hidden
          className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-rose-50 opacity-50 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 -z-10 h-48 w-48 rounded-full bg-rose-100 opacity-50 blur-3xl"
        />

        <div className="relative w-full shrink-0 md:w-5/12">
          <div className="aspect-[4/5] overflow-hidden rounded-[20px] border-4 border-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(FOUNDER_IMAGE)}
              alt="Mỹ Lệ — Founder & CEO của ML Cosmetics"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="border-rose-50 absolute -right-6 -bottom-6 animate-float rounded-xl border bg-white p-4 shadow-lg">
            <span className="text-primary text-3xl">
              <FormatQuote size={32} className="text-3xl text-primary" />
            </span>
          </div>
        </div>

        <div className="w-full space-y-6 md:w-7/12">
          <div>
            <h2 className="font-headline mb-1 text-3xl italic text-zinc-900">
              Mỹ Lệ
            </h2>
            <p className="text-primary font-body text-sm font-medium uppercase tracking-wide">
              Founder &amp; CEO
            </p>
          </div>
          <blockquote className="border-primary relative rounded-xl border-l-4 bg-rose-50/50 p-6 font-headline text-lg italic text-zinc-700">
            <span className="text-rose-200 absolute -top-3 -left-3 rounded-full bg-white text-4xl opacity-50">
              <FormatQuote size={36} className="text-rose-200 text-4xl opacity-50" />
            </span>
            &ldquo;Ngọc không chỉ là trang sức, ngọc là người bạn đồng
            hành lưu giữ thanh xuân và vượng khí của người phụ nữ hiện
            đại.&rdquo;
          </blockquote>
          <div className="font-body space-y-4 text-sm leading-relaxed text-zinc-600 md:text-base">
            <p>
              Khởi nguồn từ một tình yêu thuần khiết với vẻ đẹp bất diệt
              của ngọc cẩm thạch Myanmar, Mỹ Lệ đã dành nhiều năm tu
              nghiệp và nghiên cứu sâu sắc về ngọc học. Cô tin rằng mỗi
              viên đá đều mang một &quot;Aura&quot; (hào quang) riêng biệt,
              đang chờ đợi người chủ nhân đích thực để tỏa sáng.
            </p>
            <p>
              Từ những thiết kế sơ khai đầu tiên được chế tác thủ công
              trong một xưởng nhỏ năm 2021, đến nay ML Cosmetics tự hào
              mang đến những bộ sưu tập trang sức ngọc bích sang trọng,
              tinh tế, kết hợp hài hòa giữa nét truyền thống Á Đông và
              tư duy thẩm mỹ đương đại.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

FounderSection.displayName = "FounderSection";

/* ----------------------------------------------------------------------- *
 * Timeline
 * ----------------------------------------------------------------------- */

function TimelineSection() {
  return (
    <section className="bg-rose-50/30 py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-headline text-3xl italic text-zinc-900">
            Dấu Ấn Thời Gian
          </h2>
          <p className="font-body mt-2 text-sm uppercase tracking-widest text-zinc-500">
            Hành trình phát triển
          </p>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-rose-200 md:block" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            {TIMELINE.map((node) => (
              <TimelineNodeCard key={node.year} node={node} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

TimelineSection.displayName = "TimelineSection";

function TimelineNodeCard({ node }: { node: TimelineNode }) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      <div
        className={cn(
          "mb-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-200 bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary",
          node.highlight &&
            "border-primary animate-pulse-slow border-4 border-rose-100 text-white shadow-lg",
        )}
      >
        {node.highlight ? (
          <AutoAwesome size={20} className="text-xl text-white" />
        ) : (
          <span className="text-sm font-bold text-zinc-700">
            <span className="font-display text-sm font-bold text-zinc-700">
              {node.year}
            </span>
          </span>
        )}
      </div>
      <h3
        className={cn(
          "font-headline mb-2 text-lg font-semibold",
          node.highlight ? "text-primary italic" : "text-zinc-800",
        )}
      >
        {node.title}
      </h3>
      <p className="font-body text-sm text-zinc-500">{node.body}</p>
    </div>
  );
}

TimelineNodeCard.displayName = "TimelineNodeCard";

/* ----------------------------------------------------------------------- *
 * Values grid
 * ----------------------------------------------------------------------- */

function ValuesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
      <div className="mb-16 text-center">
        <h2 className="font-headline text-3xl italic text-zinc-900">
          Giá Trị Cốt Lõi
        </h2>
        <div className="mx-auto mt-4 h-0.5 w-16 bg-primary" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <ValueCard key={value.title} value={value} />
        ))}
      </div>
    </section>
  );
}

ValuesSection.displayName = "ValuesSection";

function ValueCard({ value }: { value: Value }) {
  return (
    <div className="group hover:-translate-y-2 rounded-[20px] border border-zinc-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="bg-rose-50 group-hover:bg-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-colors">
        <span className="text-primary text-3xl transition-colors group-hover:text-white">
          {value.icon}
        </span>
      </div>
      <h3 className="font-headline mb-3 text-xl font-semibold text-zinc-800">
        {value.title}
      </h3>
      <p className="font-body text-sm text-zinc-500">{value.body}</p>
    </div>
  );
}

ValueCard.displayName = "ValueCard";

/* ----------------------------------------------------------------------- *
 * Craft story (alternating image/text)
 * ----------------------------------------------------------------------- */

function CraftStorySection() {
  return (
    <section className="bg-white py-24 px-6 md:px-12">
      <div className="mx-auto max-w-6xl space-y-24">
        <div className="mb-16 text-center">
          <h2 className="font-headline text-3xl italic text-zinc-900">
            Nghệ Thuật Chế Tác
          </h2>
          <p className="font-body mt-2 text-sm uppercase tracking-widest text-zinc-500">
            Sự hoàn mỹ trong từng chi tiết
          </p>
        </div>
        {CRAFT_STEPS.map((step, idx) => (
          <CraftStepRow key={step.index} step={step} reversed={idx % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

CraftStorySection.displayName = "CraftStorySection";

function CraftStepRow({
  step,
  reversed,
}: {
  step: CraftStep;
  reversed: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-12",
        reversed ? "md:flex-row-reverse" : "md:flex-row",
      )}
    >
      <div className="aspect-video w-full overflow-hidden rounded-[20px] shadow-lg md:w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(step.image)}
          alt={step.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="w-full space-y-4 md:w-1/2">
        <div className="text-primary mb-2 flex items-center space-x-3">
          <span className="font-display text-2xl font-bold">{step.index}</span>
          <div className="h-[1px] w-12 bg-primary" />
        </div>
        <h3 className="font-headline text-2xl italic text-zinc-800">
          {step.title}
        </h3>
        <p className="font-body leading-relaxed text-zinc-600">{step.body}</p>
      </div>
    </div>
  );
}

CraftStepRow.displayName = "CraftStepRow";

/* ----------------------------------------------------------------------- *
 * Stats strip
 * ----------------------------------------------------------------------- */

interface Stat {
  value: React.ReactNode;
  label: string;
}

const STATS: Stat[] = [
  { value: <>1247<span className="text-primary">+</span></>, label: "Khách hàng hài lòng" },
  { value: <>4.9<span className="text-primary">/5</span></>, label: "Đánh giá sao" },
  { value: <>142</>, label: "Thiết kế độc bản" },
  { value: <>5</>, label: "Năm kinh nghiệm" },
];

function StatsStrip() {
  return (
    <section className="border-y border-rose-100 bg-white py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center divide-x divide-rose-100 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="space-y-2">
            <p className="font-display text-4xl font-bold text-zinc-800">
              {stat.value}
            </p>
            <p className="font-body text-xs uppercase tracking-wide text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

StatsStrip.displayName = "StatsStrip";

/* ----------------------------------------------------------------------- *
 * CTA strip
 * ----------------------------------------------------------------------- */

function CtaStrip() {
  return (
    <section className="bg-gradient-to-r from-rose-50 to-white px-6 py-24 text-center md:px-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="font-headline text-3xl italic leading-tight text-zinc-900 md:text-4xl">
          Cùng ML Cosmetics — Bắt đầu hành trình nét đẹp của bạn
        </h2>
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button asChild className="rounded-[16px] px-8 py-3.5 font-medium shadow-primary/20">
            <Link href="/products">
              Khám phá bộ sưu tập
              <ArrowForward size={16} className="ml-2 text-sm" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-[16px] border-2 border-primary px-8 py-3.5 font-medium text-primary hover:bg-primary/5"
          >
            <Link href="/contact">Liên hệ tư vấn</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

CtaStrip.displayName = "CtaStrip";