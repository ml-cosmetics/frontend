/**
 * Public barrel for the storefront surface. Import every component
 * used in the (public) route group from this file. Keeps the section
 * imports tidy and makes future refactors cheap.
 */
export { ProductCard } from "./product-card";
export type { ProductCardProps } from "./product-card";

export { CategoryCard } from "./category-card";
export type { CategoryCardProps } from "./category-card";

export { BannerSlider } from "./banner-slider";
export type { BannerSliderProps } from "./banner-slider";

export { StorefrontFooter } from "./storefront-footer";
export type { StorefrontFooterProps } from "./storefront-footer";

export {
  BannerSliderSkeleton,
  CategoryCardSkeleton,
  CategoryGridSkeleton,
  HeroSkeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
} from "./storefront-skeletons";

// Section blocks
export { HeroBlock } from "./sections/hero-block";
export type { HeroBlockProps } from "./sections/hero-block";

export { BannerBlock } from "./sections/banner-block";
export type { BannerBlockProps } from "./sections/banner-block";

export { FeaturedProductsBlock } from "./sections/featured-products-block";
export type { FeaturedProductsBlockProps } from "./sections/featured-products-block";

export { CategoriesBlock } from "./sections/categories-block";
export type { CategoriesBlockProps } from "./sections/categories-block";

export { AboutTeaserBlock } from "./sections/about-teaser-block";
export type { AboutTeaserBlockProps } from "./sections/about-teaser-block";

export { ContactCTABlock } from "./sections/contact-cta-block";
export type { ContactCTABlockProps } from "./sections/contact-cta-block";

export { ProductsList } from "./products-list";
export type { ProductsListProps } from "./products-list";

export { ProductDetail } from "./product-detail";
export type { ProductDetailProps } from "./product-detail";

export { ProductDetailStitch } from "./product-detail-stitch";
export type { ProductDetailStitchProps } from "./product-detail-stitch";

export { Breadcrumb } from "./breadcrumb";
export type { BreadcrumbItem, BreadcrumbProps } from "./breadcrumb";

export { ProductsToolbar } from "./products-toolbar";
export type {
  FilterChipDefinition,
  ProductsToolbarProps,
} from "./products-toolbar";

export { ProductsPagination } from "./products-pagination";
export type { ProductsPaginationProps } from "./products-pagination";

export { FilterChips } from "./filter-chips";
export type { ActiveFilter, FilterChipsProps } from "./filter-chips";

export {
  ProductsHeroSmall,
  defaultProductStats,
} from "./products-hero-small";
export type {
  ProductsHeroSmallProps,
  ProductsHeroStat,
} from "./products-hero-small";

export { HomepageSkeleton } from "./homepage-skeleton";
export type { HomepageSkeletonProps } from "./homepage-skeleton";

export { HomePageClient } from "./home-page-client";

export { SearchEmptyState } from "./search-empty-state";
export type {
  SearchEmptyCategoryTile,
  SearchEmptyStateProps,
  SearchEmptySuggestion,
} from "./search-empty-state";
