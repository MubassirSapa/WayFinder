import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { PUBLIC_ROUTES } from "@/constants/routes";

const BrandHeader = ({ className, href = PUBLIC_ROUTES.HOME }: TProps) => {
  return (
    <WayfinderBrand
      href={href}
      className={className}
      iconClassName="size-9"
      textClassName="font-heading text-lg font-semibold"
    />
  );
};

export default BrandHeader;

type TProps = {
  className?: string;
  href?: string;
};
