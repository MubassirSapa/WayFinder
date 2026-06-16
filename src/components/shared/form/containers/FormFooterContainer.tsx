const FormFooterContainer = ({ children }: TProps) => {
  return <div className="flex w-full flex-col items-center gap-4">{children}</div>;
};

export default FormFooterContainer;

type TProps = {
  children: React.ReactNode;
};
