import { useTranslation } from "react-i18next";
import LogoWithSloganEN from "../assets/en/Logo with Slogan EN.svg";
import LogoWithSloganFR from "../assets/fr/Logo with Slogan FR.svg";
import LogoEN from "../assets/en/Logo EN.svg";
import LogoFR from "../assets/fr/Logo FR.svg";
interface LogoProps {
  variant?: "with-slogan" | "mark-only";
  className?: string;
  alt?: string;
}

export default function Logo({
  variant = "with-slogan",
  className = variant === "with-slogan" 
    ? "h-auto" 
    : "w-32 md:w-40 h-auto",
  alt = "Turath Collective",
}: LogoProps) {
  const { i18n } = useTranslation();
  const isFr = i18n.language === "fr";

  const src =
    variant === "mark-only"
      ? isFr ? LogoFR : LogoEN
      : isFr ? LogoWithSloganFR : LogoWithSloganEN;

  return <img src={src} alt={alt} className={className} />;
}