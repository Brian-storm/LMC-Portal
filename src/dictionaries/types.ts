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
export type CourseViewDict = Dictionary["courseView"]
export type TermsPageDict = Dictionary["termsPage"]
export type PrivacyPageDict = Dictionary["privacyPage"]
export type AboutPageDict = Dictionary["aboutPage"]
export type ContactPageDict = Dictionary["contactPage"]
export type LoginPageDict = Dictionary["loginPage"]
export type RegisterPageDict = Dictionary["registerPage"]
export type LoadingPageDict = Dictionary["loadingPage"]
export type EnrollPageDict = Dictionary["enrollPage"]
export type PaymentUploadDict = Dictionary["paymentUpload"]
export type ReceiptDict = Dictionary["receipt"]
export type EmailDict = Dictionary["email"]