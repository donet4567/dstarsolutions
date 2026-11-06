export const PHONE = "917558920076";
export const DEFAULT_MESSAGE = "Hello D Star, I would like to discuss a website or web application project.";

export const SITE_URL = "https://www.dstarsolutions.in";
export const SITE_NAME = "D Star IT Solutions";
export const whatsappUrl = (message = DEFAULT_MESSAGE) => `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
export const defaultWhatsApp = whatsappUrl();
export const DISPLAY_PHONE = "+91 75589 20076";
