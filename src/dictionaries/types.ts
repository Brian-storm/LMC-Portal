import en from "./en.json";

// Inferred type directly matching your dictionary structure
export type Dictionary = typeof en;

// Slice types for individual components
export type NavDict = Dictionary["nav"];
export type AccessibilityDict = Dictionary["accessibility"];
export type BreadcrumbsDict = Dictionary["breadcrumbs"];
export type HeroCarouselDict = Dictionary["heroCarousel"];
export type CredentialsBarDict = Dictionary["credentialsBar"];
export type FeatureCardsDict = Dictionary["featureCards"];
export type NewsletterFormDict = Dictionary["newsletterForm"];
export type FooterDict = Dictionary["footer"];
